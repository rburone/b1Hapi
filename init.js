'use strict'

const configLoader = require('./lib/configLoader')  // Global configuration reader
const server       = require('./server')            // Server hapi
const config       = configLoader.read()            // Read configuration file configured in .env

require('./lib/b1-colorString.js')

const d = dateStr => {
    const [date, time] = dateStr.split('T')
    const d = date.split('-')
    const t = time.split(':')
    return `${d[2]}/${d[1]}/${d[0]}, ${t[0]}:${t[1]}`
}


server.init(config).then(server => {
    if (true) {
        console.log('\n\n ██▄ ▄█ █▄█ ▄▀▄ █▀▄ █ \n █▄█  █ █ █ █▀█ █▀  █ '.FgBlue)
        const ver = '┤ v.%s ├─'.padStart(17, '─')
        console.log(` ${ver.Bright.FgBlue}`, config.version)
        console.log('\nRunning on %s', server.info.uri.Margin.Bright.BgGreen)
        console.log('Node_env: %s', config.NODE_ENV.Bright.FgGreen)
        console.log('Started from: %s', config.sysRoot.FgGreen.Bright)
        console.log('Config: %s', config.file.Bright.FgGreen)
        console.log('Started at: %s', d((new Date()).toISOString()).Bright.FgGreen)
        // console.table(server.methods.getConf('server'))
        // console.log('\n')
    } else {
        console.log(new Date(), server.info.uri, 'START OK!\n')
    }
}).catch(err => {
    console.log(err)
    process.exit(1)
})
