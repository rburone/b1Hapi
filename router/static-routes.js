// const config = require('../lib/configLoader').data.server

module.exports = [
    {
        method: 'GET',
        path: '/{param*}',
        options: {
            auth: false
        },
        handler: {
            directory: {
                path: '.',
                // index: ['index.html', 'default.html']
                redirectToSlash: true,
                listing: true
            }
        }
    }
]