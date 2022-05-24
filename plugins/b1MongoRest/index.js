'use strict'
const Boom = require('@hapi/boom')
const Joi  = require('joi')

const validMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']

const {string, boolean, array} = Joi.types();
const internals = {
    RouteSchema: {
        name   : string.required(),
        cmd    : string.required(),
        method : string.uppercase().valid(...validMethods).required(),
        path   : string.required(),
        descrip: string,
    },

    ACLSchema: Joi.object({
        name       : string.required(),
        permissions: array.required(),
    }),

    OptionsSchema: Joi.object({
        api: Joi.object({
            routes: array.items(Joi.object(this.RouteSchema)).required(),
            model : Joi.object().required()
        }),
        path   : string.allow('').required(),
        verbose: boolean,
    })
}

function genFilter(req, ObjectID) {
    let match = {}
    let sort = false
    let projection = {}
    if (Object.keys(req.params).length > 0) {
        Object.keys(req.params).forEach(key => {
            if (key == '_id' && req.params['_id'].length == 24) {
                req.params['_id'] = new ObjectID(req.params._id)
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

function createRoute(model, permissions, definition, apiPATH, verbose) {
    const {cmd, method, path} = definition

    const routerDef = {
        method,
        path: apiPATH + path.replace(':model', model),
    }

    if (permissions.length > 0) {
        routerDef.options = {
            plugins: {
                hacli: {
                    permissions
                }
            }
        }
    }

    if (method.toUpperCase() == 'GET') {
        routerDef.handler = async (req) => {
            const db = req.mongo.db
            const ObjectID = req.mongo.ObjectID;

            let response
            try {
                const {match, sort, projection} = genFilter(req, ObjectID)
                const result = await db.collection(model)[cmd](match, projection)
                if (result.constructor.name == 'FindCursor') {
                    if (sort) {
                        response = {data: await result.sort(sort).toArray()}
                    }
                    
                    response = {data: await result.toArray()}
                } else {
                    response = {data: result}
                }
                if (verbose) {
                    console.log(`Last ${cmd} in ${model}: ${response.data.length} registers returned.`)
                    console.log(`Query: \n${JSON.stringify(match)}`)
                }

                return response
            } catch (err) {
                throw Boom.internal('Internal MongoDB error', err)
            }
        }
    } else {
        routerDef.handler = async (req) => {
            const db = req.mongo.db
            const payload = req.payload || null

            try {
                const result = await db.collection(model)[cmd](payload).toArray()
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
        server.assert(Joi.assert, options, internals.OptionsSchema, '[plugin:b1MongoRest:options]')

        const modelDef     = options.api.model
        const routesDef    = options.api.routes
        const apiPATH      = options.path || ''
        const verbose      = options.verbose || false

        Object.keys(modelDef).forEach(modelName => {
            modelDef[modelName].forEach(ACLDef => {
                const {error, value} = internals.ACLSchema.validate(ACLDef)
                if (!error) {
                    const defRoute = routesDef.find(rt => rt.name == value.name)
                    if (defRoute) {
                        const route = createRoute(modelName, value.permissions, defRoute, apiPATH, verbose)
                        server.createRoute(route)
                    } else {
                        const error = new Error(`No exists \x1b[1m${value.name}\x1b[0m named route`)
                        error.code = 'NOCRITICAL'
                        server.errManager({error, from: `[plugin:b1MongoRest:routesDefinitionCreation]`})
                    }
                } else {
                    server.errManager({error, from: `[plugin:b1MongoRest:ACLValidation]`})
                }
            })
        })
    }
}
