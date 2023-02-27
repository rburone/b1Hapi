'use strict'
/******************************************************
* b1ShellExec.js
* Creates a server method to exec shell scripts
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*/
const Joi  = require('joi');
const fs   = require('fs')
const path = require('path')

const {string, boolean} = Joi.types();
const OptionsSchema = Joi.object({
    path      : string.pattern(/^\/(?!\/).*[^\/]$/, 'REST API path'),
    scriptPath: string,
    sysRoot   : string,
    autoCreate: boolean,
})

module.exports = {
    name: 'b1ShellExec',
    async register(server, options) {
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1ShellExec:options]')

        const sysScriptPath = path.normalize(`${options.sysRoot}/${options.scriptPath}`)
        try {
            fs.accessSync(sysScriptPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            server.errManager({error, from: `[plugin:b1ShellExec:access] => ${sysScriptPath}`})
            process.exit(1)
        }

        const routes = require('./routes.js')
        routes.forEach(route => route.path = `${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes, {sysScriptPath, errManager: server.errManager, autoCreate: options.autoCreate})
    }
}
