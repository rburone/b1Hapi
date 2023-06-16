'use strict'
const Boom = require('@hapi/boom')
const Joi  = require('joi')
const log  = require('../../lib/console_helper')

const validMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']

const { string, boolean, array } = Joi.types();

const RouteSchema = Joi.object({
    name   : string.required(),
    cmd    : string.required(),
    method : string.uppercase().valid(...validMethods).required(),
    path   : string.required(),
    descrip: string,
})

const ACLSchema = Joi.object({
    name: string.required(),
    permissions: array.required(), // TODO: View if posible validates width config.acl.roles [11/03/2023]
})

const ModelSchema = Joi.object({
    name: string.required(),
    dataSource: string.required(),
    actions: array.items(ACLSchema).required()
})

const OptionsSchema = Joi.object({
    api: {
        routes: array.items(RouteSchema).required(),
        model: array.items(ModelSchema).required()
    },
    path: string.allow('').required(),
    verbose: boolean,
    dbList: Joi.object()
})

function genFilter(req, ObjectID) {
    let match = {}
    let sort = false
    let projection = {}

    if (Object.keys(req.params).length > 0) {
        Object.keys(req.params).forEach(key => {
            //HACK Used while model schemes are not defined
            if (key == '_id' && req.params['_id'].length == 24) {
                req.params['_id'] = new ObjectID(req.params._id)
            } else if (!isNaN(req.params['_id'])) {
                const num_id = req.params._id * 1
                req.params['$or'] = [{ "_id": num_id }, { "_id": req.params._id }]
                delete req.params._id
            }
        })
        match = req.params
    } else if (req.query.filter) {
        const filter = JSON.parse(req.query.filter)
        if (filter.where) {
            match = filter.where
        }

        if (filter.order) {
            sort = filter.order
        }

        if (filter.fields) {
            projection = { projection: filter.fields }
        }
    }
    return { match, sort, projection }
}

function genSet(payload) {
    const set = { $set: {} }
    Object.keys(payload).forEach(key => {
        set.$set[key] = payload[key]
    })
    return set
}

function createRoute(modelData, permissions, definition, apiPATH, verbose, dbList) {
    let { cmd, method, path }  = definition
    const { name, dataSource } = modelData

    const routerDef = {
        method,
        path: apiPATH + path.replace(':model', name),
    }

    if (permissions.length > 0 && permissions[0] != '*') {
        routerDef.options = {
            plugins: {
                hacli: {
                    permissions
                }
            }
        }
    } else {
        routerDef.options = {
            auth: false
        }
    }

    routerDef.handler = async (req) => {
        const idxDB    = dbList[dataSource]
        const db       = Array.isArray(req.mongo.db) ? req.mongo.db[idxDB] : req.mongo.db
        const ObjectID = req.mongo.ObjectID;
        const methodUC = method.toUpperCase()
        let   response = []

        if (verbose) {
            console.log(`Try [${methodUC}] ${cmd} in ${name}.`)
        }

        if (methodUC == 'GET') {
            const { match, sort, projection } = genFilter(req, ObjectID)

            if (verbose) {
                console.log(`Query: \n${JSON.stringify(match)}`)
            }

            try {
                const result = await db.collection(name)[cmd](match, projection)

                if (result.constructor.name == 'FindCursor') {
                    if (sort) {
                        response = { data: await result.sort(sort).toArray() }
                    } else {
                        response = { data: await result.toArray() }
                    }
                } else {
                    response = { data: result }
                }

                if (verbose) {
                    // console.log(`Query: ${JSON.stringify(match)}`)
                    console.log(`${C.BgWhite + C.FgBlack + (new Date()).toTimeString().split(' ')[0] + C.Reset} ${C.FgGreen + cmd + C.Reset} in ${C.FgGreen + name + C.Reset}: ${response.data.length} registers returned.`)
                }

                return response
            } catch (error) {
                throw Boom.internal('Internal MongoDB error [GET]', error)
            }

        } else {
            const payload = req.payload || null
            if (payload) {
                if (Array.isArray(payload)) { // -------- BULK OPERATION
                    if (methodUC == 'POST') {
                        try {
                            const result = await db.collection(name).insertMany(payload, { ordered: false })
                            return result
                        } catch (err) {
                            if (err.code == 11000) {
                                log('warning', 'MongodDB', `Duplicate key`, '[b1MongoRest:POST]')
                                throw Boom.conflict('Duplicate key', err)
                            }
                            throw Boom.badRequest(`Internal MongoDB error [${methodUC}]`)
                        }
                    } else {
                        const upsert = methodUC == 'PUT'; // upsert if PUT
                        const bulkOperations = []
                        payload.forEach(document => {
                            bulkOperations.push({
                                replaceOne: {
                                    filter: { _id: document._id }, // TODO Ver si no hay ID
                                    replacement: document,
                                    upsert,
                                },
                            });
                        })

                        try {
                            const result = await db.collection(name).bulkWrite(bulkOperations)
                            return result
                        } catch (error) {
                            throw Boom.internal(`Internal MongoDB error [${methodUC}]`, error)
                        }
                    }
                } else {
                    const { match } = genFilter(req, ObjectID)
                    payload = methodUC == 'PATCH' ? genSet(req.payload) : req.payload
                    try {
                        const result = await db.collection(name)[cmd](match, payload)
                        return result
                    } catch (error) {
                        throw Boom.internal(`Internal MongoDB error [${methodUC}]`, error)
                    }
                }
            } else {
                throw Boom.badRequest(`Internal MongoDB error [${methodUC}]`, 'No payload')
            }
        }
    }

    return routerDef
}

module.exports = {
    name: 'b1MongoRest',
    register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1MongoRest:options]')

        const modelDef  = options.api.model
        const routesDef = options.api.routes
        const apiPATH   = options.path || ''
        const verbose   = options.verbose || false
        const dbList    = options.dbList

        modelDef.forEach(modelData => {
            modelData.actions.forEach(ACLDef => {
                const defRoute = routesDef.find(rt => rt.name == ACLDef.name)
                if (defRoute) {
                    const route = createRoute(modelData, ACLDef.permissions, defRoute, apiPATH, verbose, dbList)
                    server.createRoute(route)
                } else {
                    const error = new Error(`No exists \x1b[1m${ACLDef.name}\x1b[0m named route`)
                    error.code = 'NOCRITICAL'
                    server.errManager({ error, from: `[plugin:b1MongoRest:routesDefinitionCreation]` })
                }
            })
        })
    }
}
