'use strict'
const Boom = require('@hapi/boom')
const Joi  = require('joi')

const validMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']

const {string, boolean, array} = Joi.types();

const RouteSchema = Joi.object({
    name   : string.required(),
    cmd    : string.required(),
    method : string.uppercase().valid(...validMethods).required(),
    path   : string.required(),
    descrip: string,
})

const ACLSchema = Joi.object({
    name       : string.required(),
    permissions: array.required(), // TODO: View if posible validates width config.acl.roles [11/03/2023]
})

const ModelSchema = Joi.object({
    name      : string.required(),
    dataSource: string.required(),
    actions   : array.items(ACLSchema).required()
})

const OptionsSchema = Joi.object({
    api: {
        routes: array.items(RouteSchema).required(),
        model : array.items(ModelSchema).required()
    },
    path   : string.allow('').required(),
    verbose: boolean,
    dbList : Joi.object()
})

function genFilter(req, ObjectID) {
    let match = {}
    let sort = false
    let projection = {}

    if (Object.keys(req.params).length > 0) {
        Object.keys(req.params).forEach(key => {
            // (::[]::) Used while model schemes are not defined
            if (key == '_id' && req.params['_id'].length == 24) {
                req.params['_id'] = new ObjectID(req.params._id)
            } else if (!isNaN(req.params['_id'])) {
                const num_id = req.params._id * 1
                req.params['$or'] = [{"_id": num_id}, {"_id": req.params._id}]
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
            projection = {projection: filter.fields}
        }
    }
    return {match, sort, projection}
}

function genSet(payload) {
    const set = {$set:{}}
    Object.keys(payload).forEach(key => {
        set.$set[key] = payload[key]
    })
    return set
}

function createRoute(modelData, permissions, definition, apiPATH, verbose, dbList) {
    const { cmd, method, path } = definition
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

    const idxDB = dbList[dataSource]

    if (method.toUpperCase() == 'GET') {
        routerDef.handler = async (req) => {
            const db = req.mongo.db[idxDB]

            const ObjectID = req.mongo.ObjectID;
            let response

            try {
                const {match, sort, projection} = genFilter(req, ObjectID)
                if (verbose) {
                    console.log(`Try ${cmd} in ${name}.`)
                    console.log(`Query: \n${JSON.stringify(match)}`)
                }
                const result = await db.collection(name)[cmd](match, projection)
                if (result.constructor.name == 'FindCursor') {
                    if (sort) {
                        response = {data: await result.sort(sort).toArray()}
                    }

                    response = {data: await result.toArray()}
                } else {
                    response = {data: result}
                }

                if (verbose) {
                    console.log(`Last ${cmd} in ${name}: ${response.data.length} registers returned.`)
                }

                return response
            } catch (err) {
                throw Boom.internal('Internal MongoDB error [GET]', err)
            }
        }
    } else if (method.toUpperCase() == 'PATCH') {
        routerDef.handler = async (req) => {
            const db = req.mongo.db[idxDB]
            const ObjectID = req.mongo.ObjectID;

            if (req.payload) {
                const {match} = genFilter(req, ObjectID)
                const set = genSet(req.payload)

                if (verbose) {
                    console.log(`Try ${cmd} in ${name}.`)
                    console.log(`Query: \n${JSON.stringify(match)}`)
                    console.log('Set: %s', JSON.stringify(set))
                }

                try {
                    const result = await db.collection(name)[cmd](match, set)
                    return result
                }
                catch (error) {
                    throw Boom.internal('Internal MongoDB error [PATCH]', error)
                }
            } else {
                throw Boom.badRequest('Internal MongoDB error [PATCH]', 'No payload')
            }
        }
    } else if (method.toUpperCase() == 'PUT') {
        routerDef.handler = async (req) => {
            console.log('PUT', req.params)
            const db = req.mongo.db[idxDB]
            const ObjectID = req.mongo.ObjectID;

            if (req.payload) {
                const {match} = genFilter(req, ObjectID)
                // const set = genSet(req.payload)

                if (verbose) {
                    console.log(`Try ${cmd} in ${dataSource}.${name}.`)
                    console.log(`Query: \n${JSON.stringify(match)}`)
                    console.log(req.payload)
                }

                try {
                    const result = await db.collection(name)[cmd](match, req.payload)
                    return result
                }
                catch (error) {
                    throw Boom.internal('Internal MongoDB error [PUT]', error)
                }
            } else {
                throw Boom.badRequest('Internal MongoDB error [PUT]', 'No payload')
            }
        }
    } else {
        routerDef.handler = async (req) => {
            const db = req.mongo.db[idxDB]
            const payload = req.payload || null

            if (verbose) {
                console.log(`Try ${cmd} in ${name}.`)
                console.log(`Query: \n${JSON.stringify(match)}`)
            }

            try {
                const result = await db.collection(name)[cmd](payload).toArray()
                return result
            }
            catch (err) {
                throw Boom.internal('Internal MongoDB error', err)
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
                    server.errManager({error, from: `[plugin:b1MongoRest:routesDefinitionCreation]`})
                }
            })
        })
    }
}
