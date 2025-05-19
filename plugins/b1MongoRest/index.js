'use strict'
const Boom   = require('@hapi/boom')
const Joi    = require('joi')
const log    = require('../../lib/console_helper')
// const { it } = require('../../lib/b1Utils')

const { validate/*, tryAttemp*/ } = require('../../lib/methods').b1Lib

require('../../lib/b1-colorString')

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
    name      : string.required(),
    dataSource: string.required(),
    actions   : array.items(ACLSchema).required(),
    schema: [
        string.required(),
        Joi.object()
    ]
})

const OptionsSchema = Joi.object({
    api: {
        routes: array.items(RouteSchema).required(),
    },
    models : array.items(ModelSchema).required(),
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

async function tryGet(db, name, cmd, req, ObjectID, verbose = false) {
    const { match, sort, projection } = genFilter(req, ObjectID)
    let response = []

    if (verbose) {
        // console.log(`Query: \n${JSON.stringify(match)}`)
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
            // console.log(`${C.BgWhite + C.FgBlack + (new Date()).toTimeString().split(' ')[0] + C.Reset} ${C.FgGreen + cmd + C.Reset} in ${C.FgGreen + name + C.Reset}: ${response.data.length} registers returned.`)
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} ${cmd.FgGreen} in ${name.FgGreen}: ${response.data.length} registers returned.`)
            console.log(`Query: ${JSON.stringify(match)}`)
        }

        return response
    } catch (error) {
        throw Boom.internal('Internal MongoDB error [GET]', error)
    }
}

async function tryDelete(db, name, cmd, req, ObjectID, verbose = false) {
    const { match } = genFilter(req, ObjectID)
    let response = []

    if (verbose) {
        // console.log(`Query: \n${JSON.stringify(match)}`)
    }

    try {
        const result = await db.collection(name)[cmd](match)

        response = { data: result.deletedCount }

        if (verbose) {
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} ${cmd.FgGreen} in ${name.FgGreen}: ${response.data} registers deleted.`)
        }

        return response
    } catch (error) {
        throw Boom.internal('Internal MongoDB error [DELETE]', error)
    }
}

async function tryDrop(db, name, verbose = false) {
    try {
        const result = await db.collection(name)[cmd]()

        if (verbose) {
            // console.log(`${C.BgWhite + C.FgBlack + (new Date()).toTimeString().split(' ')[0] + C.Reset} ${C.FgGreen + cmd + C.Reset} in ${C.FgGreen + name + C.Reset}: ${response.data.length} registers returned.`)
            console.log(`${(new Date()).toTimeString().split(' ')[0].BgWhite.FgBlack} ${cmd.FgGreen} in ${name.FgGreen}: ${response}.`)
            // console.log(`Query: ${JSON.stringify(match)}`)
        }

        return result
    } catch (error) {
        throw Boom.internal('Internal MongoDB error [DROP]', error)
    }
}

function createRoute(modelData, permissions, definition, apiPATH, verbose, dbList) {
    let { cmd, method, path }  = definition
    const { name, dataSource } = modelData

    const schema = modelData.schema ? modelData.schema : false

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

        if (verbose) {
            console.log(`Try ${methodUC} (${cmd}) in ${name}.`)
        }

        if (methodUC == 'GET') {
            return await tryGet(db, name, cmd, req, ObjectID, verbose)
        } else if (methodUC == 'DELETE') {
            if (cmd.toUpperCase() == 'DROP') {
                return await tryDrop(db, name, verbose)
            } else {
                return await tryDelete(db, name, cmd, req, ObjectID, verbose)
            }
        } else {
            let payload = req.payload || null
            if (payload) {
                let cleanPayload = []
                if (Array.isArray(payload)) { // -------- BULK OPERATION
                    if (payload.length > 0) {
                        if (schema) {
                            for (let i = 0; i < payload.length; i++) {
                                const valid = validate(payload[i], schema)
                                // if (valid) cleanPayload.push(payload[i])
                                if (valid) cleanPayload.push(valid)
                                else {
                                    console.log(`In register ${i}: ${payload[i]}`)
                                    throw Boom.badData('[BULK OPERATION] Payload validation error')
                                }
                            }
                            if (cleanPayload.length == 0) throw Boom.badData('Empty payload after validation');
                        } else cleanPayload = payload

                        if (methodUC == 'POST') {
                            try {
                                const result = await db.collection(name).insertMany(cleanPayload, { ordered: false })
                                if (verbose) console.log(`Payload size: ${cleanPayload.length}`);
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
                            cleanPayload.forEach(document => {
                                const query = {
                                    replaceOne: {
                                        filter: {},
                                        replacement: document,
                                        upsert,
                                    },
                                }
                                if (document._id) {
                                    query.replaceOne.filter = { _id: document._id }
                                }

                                bulkOperations.push(query);
                            })

                            try {
                                const result = await db.collection(name).bulkWrite(bulkOperations)
                                if (verbose) console.log(`Result: Ins: ${result.insertedCount}  Ups: ${result.upsertedCount}  Mod: ${result.modifiedCount}  of ${bulkOperations.length}`);
                                return result
                            } catch (error) {
                                console.log(error.constructor.name, error.message); // TODO: Mostrar mejor
                                throw Boom.internal(`Internal MongoDB error [${methodUC}]`, error)
                            }
                        }
                    } else {
                        throw Boom.badRequest(`Internal MongoDB error [${methodUC}] empty payload`, 'Empty payload')
                    }
                } else { // -------------------------------------------- UNIT OPERATION
                    const { match } = genFilter(req, ObjectID)
                    if (schema) {
                        cleanPayload = validate(payload, schema)
                    } else cleanPayload = payload

                    cleanPayload = methodUC == 'PATCH' ? genSet(cleanPayload) : cleanPayload

                    try {
                        let result
                        if (methodUC == 'POST') {
                            // console.log(cleanPayload);
                            result = await db.collection(name)[cmd](cleanPayload)
                            // console.log(result);
                        } else {
                            result = await db.collection(name)[cmd](match, cleanPayload)
                        }
                        return result
                    } catch (error) {
                        throw Boom.internal(`Internal MongoDB error [${methodUC}]`, error)
                    }
                }
            } else {
                throw Boom.badRequest(`Internal MongoDB error [${methodUC}] expected payload not found`, 'No payload')
            }
        }
    }

    return routerDef
}

module.exports = {
    name: 'b1MongoRest',
    register(server, options) {
        // process.exit()
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1MongoRest:options]')
        const modelDef  = options.models
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
                    const error      = new Error(`No exists ${ACLDef.name.Bright} named route`)
                          error.code = 'NOCRITICAL'
                    server.errManager({ error, from: `[plugin:b1MongoRest:routesDefinitionCreation]` })
                }
            })
        })
    }
}
