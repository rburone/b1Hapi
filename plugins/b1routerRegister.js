'use strict'
/******************************************************
* b1routerRegister.js
* Decorate server with a function to create routes relative to a configured path
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*
* server.createRoute(route)
* Route can be object or array.
* Routes are defined as they would be done in Hapi
*
* Route /route add to get list of registered routes.
*/
const Joi = require('@hapi/joi')

const validMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']

const {string, boolean, array} = Joi.types();
const RouteSchema = Joi.object({
    method: string.uppercase().valid(...validMethods).required(),
    path: string.pattern(/^\/(?!\/).*[^\/]$/, 'REST API path'),
    options: Joi.object({
        payload: Joi.object(),
        auth: boolean,
        plugins: Joi.object({
            hacli: Joi.object({
                permissions: array.items(string.required()).unique(),
                permission : string,
            }).xor('permissions','permission')
        }),
        validate: Joi.object(),
    }),
    handler: Joi.function().required()
})

const OptionsSchema = Joi.object({
    rootAPI: string.allow('').pattern(/^\/(?!\/).*[^\/]$/, 'REST API path').required(),
})

module.exports = {
    name:'routerRegister',
    register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:routerRegister:options]')
        const createdRoutes = []
        server.decorate('server', 'createRoute', (newRoute, bind = false) => {
            if (bind) server.bind(bind)
            if (!Array.isArray(newRoute)) { newRoute = [newRoute]}
            newRoute.forEach(route => {
                route.path = `${options.rootAPI}${route.path}`
                const {error, value} = RouteSchema.validate(route)
                if (!error) {
                    createdRoutes.push(`[${value.method}] ${value.path}`)
                    server.route(value)
                } else {
                    server.errManager({error, from: `[plugin:routerRegister:routeValidation]`})
                }
            });
        })

        server.route({
            method: 'GET',
            path: `${options.rootAPI}/routes`,
            options: {
                auth: false
            },
            handler: (req) => {
                return createdRoutes
            }
        })
    }
}