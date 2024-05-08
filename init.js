'use strict'

const configLoader = require('./lib/configLoader')  // Global configuration reader
const server       = require('./server')            // Server hapi
const config       = configLoader.read()            // Read configuration file configured in .env
const say = require('./lib/console_helper.js')

require('./lib/b1-colorString.js')

const d = dateStr => {
    const [date, time] = dateStr.split('T')
    const d = date.split('-')
    const t = time.split(':')
    return `${d[2]}/${d[1]}/${d[0]}, ${t[0]}:${t[1]}`
}

console.clear()
const showInitInfo = true
server.init(config).then(server => {
    if (showInitInfo) {
        console.log('\n ██▄ ▄█ █▄█ ▄▀▄ █▀▄ █ \n █▄█  █ █ █ █▀█ █▀  █ '.FgBlue)
        const ver = '┤ v.%s ├─'.padStart(17, '─')
        console.log(` ${ver.Bright.FgBlue}`, config.version)
        say('highlight','\nRunning on', server.info.uri)
        say('info','Node_env:', config.NODE_ENV)
        say('info','Started from:', config.sysRoot)
        say('info','Config:', config.file)
        say('info','Started at:', d((new Date()).toISOString()))
        // console.table(server.methods.getConf('server'))
        // console.log('\n')
    } else {
        say('info',new Date(), server.info.uri + ' START OK!\n')
    }
}).catch(err => {
    console.log(err)
    process.exit(1)
})
