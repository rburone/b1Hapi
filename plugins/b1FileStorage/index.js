'use strict'
/******************************************************
* b1FileStorage.js
* Creates a server method to upload and store files
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*/
const Joi  = require('joi');
const fs   = require('fs')
const path = require('path')

const {string, boolean} = Joi.types();
const OptionsSchema = Joi.object({
    path      : string.pattern(/^\/(?!\/).*[^\/]$/, 'REST API path'),
    storage   : string,
    sysRoot   : string,
    autoCreate: boolean,
})

module.exports = {
    name: 'b1FileStorage',
    async register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1FileStorage:options]')

        const sysStorePath = path.normalize(`${options.sysRoot}/${options.storage}`)
        try {
            fs.accessSync(sysStorePath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            server.errManager({error, from: `[plugin:b1FileStorage:access] => ${sysStorePath}`})
            process.exit(1)
        }

        const routes = require('./routes.js')
        routes.forEach(route => route.path = `${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes, {sysStorePath, errManager: server.errManager, autoCreate: options.autoCreate})
    }
}