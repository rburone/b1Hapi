'use strict'
const Boom     = require('@hapi/boom')
const Joi      = require('joi')
const b1Socket = require('./b1Socket.js')
const say      = require('../../lib/console_helper')

const { string, number } = Joi.types();
const OptionsSchema = Joi.object({
    // IP  : string.pattern(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).required(),
    // port: number.integer().required(),
    path: string.pattern(/^\/(?!\/).*[^\/]$/, 'REST API path').required(),
})

module.exports = {
    name: 'Telnet',
    register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:telnet:options]')
        const routes = require('./routes.js')
        routes.forEach(route => route.path = `${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes, { errManager: server.errManager })
    }
}
