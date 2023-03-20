'use strict'

const configLoader = require('./lib/configLoader')  // Global configuration reader
const server       = require('./server')            // Server hapi
const C            = require('./lib/color_codes')   // Basic library for console colors

const config       = configLoader.read()            // Read configuration file configured in .env

server.init(config).then(server => {
    if (false) {
        console.log(`\n\nb1Hapi ${C.Bright}v.%s${C.Reset} running on ${C.Bright}%s${C.Reset}`, config.version, server.info.uri)
        console.log(`Started from: ${C.Bright}%s${C.Reset}`, config.sysRoot)
        console.log(`Node_env: ${C.Bright}%s${C.Reset}`, config.NODE_ENV)
        console.log(`Config: ${C.Bright}%s${C.Reset}`, config.file)
        console.log(`DB: ${C.Bright}%s${C.Reset}`, config.dataBase.url)
        console.log('%s', new Date())
        console.table(server.methods.getConf('server'))
        console.log('\n')
    } else {
        console.log(new Date(), server.info.uri, 'START OK!\n')
    }
}).catch(err => {
    console.log(err)
    process.exit(1)
})
