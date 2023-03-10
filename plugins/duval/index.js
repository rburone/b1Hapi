'use strict'
/******************************************************
* duval.js
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*/
const Joi  = require('joi');
const fs   = require('fs')
const path = require('path')

const {string, boolean} = Joi.types();
const OptionsSchema = Joi.object({
    path : string.pattern(/^\/(?!\/).*[^\/]$/, 'REST API path')
})

module.exports = {
    name: 'duval',
    async register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:duval:options]')

        const routes = require('./routes.js')
        routes.forEach(route => route.path = `${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes, {errManager: server.errManager})
    }
}
