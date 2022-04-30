'use strict'
const Hoek = require('@hapi/hoek')

module.exports = {
    name: 'toolsRoutes',
    register(server, options) {
        Hoek.assert(typeof (server.createRoute) == 'function', 'Plugin routerRegister is missing!')
        const routes = require('./routes.js')

        // routes.forEach(route => route.path = `${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        routes.forEach(route => route.path = `/${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes)
    }
}