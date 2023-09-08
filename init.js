'use strict'

const configLoader = require('./lib/configLoader')  // Global configuration reader
const server       = require('./server')            // Server hapi
const C            = require('./lib/color_codes')   // Basic library for console colors

const config       = configLoader.read()            // Read configuration file configured in .env

const d = dateStr => {
    const [date, time] = dateStr.split('T')
    const d = date.split('-')
    const t = time.split(':')
    return `${d[2]}/${d[1]}/${d[0]}, ${t[0]}:${t[1]}`
}


server.init(config).then(server => {
    if (true) {
        console.log(`\n\n ${C.FgBlue}██▄ ▄█ █▄█ ▄▀▄ █▀▄ █ \n █▄█  █ █ █ █▀█ █▀  █ `)
        const ver = `┤ v.%s ├─`.padStart(17, '─')
        console.log(` ${C.Bright}${C.FgBlue}${ver}${C.Reset}`, config.version)
        // console.log(`             ${C.Bright}${C.FgBlue}v.%s${C.Reset}`, config.version)
        console.log(`\nRunning on ${C.Bright}${C.BgGreen} %s ${C.Reset}`, server.info.uri)
        console.log(`Node_env: ${C.Bright}${C.FgGreen}%s${C.Reset}`, config.NODE_ENV)
        console.log(`Started from: ${C.FgGreen}${C.Bright}%s\x1b[0m`, config.sysRoot)
        console.log(`Config: ${C.Bright}${C.FgGreen}%s${C.Reset}`, config.file)
        console.log(`Started at: ${C.Bright}${C.FgGreen}%s${C.Reset}`, d((new Date()).toISOString()))
        // console.table(server.methods.getConf('server'))
        // console.log('\n')
    } else {
        console.log(new Date(), server.info.uri, 'START OK!\n')
    }
}).catch(err => {
    console.log(err)
    process.exit(1)
})
