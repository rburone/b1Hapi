'use strict'
const assert = require('node:assert').strict;

module.exports = {
    name: 'toolsRoutes',
    register(server, options) {
        assert.equal(typeof (server.createRoute),'function', 'Plugin routerRegister is missing!')
        const routes = require('./routes.js')
        routes.forEach(route => route.path = `/${options.path}${route.path}`) // 👨‍💻 Put the apipath prefix to all routes
        server.createRoute(routes)
    }
}
