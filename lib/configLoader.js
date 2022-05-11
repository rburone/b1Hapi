'use strict'
const fs          = require('fs')
const Hoek        = require('@hapi/hoek')
const packagejson = require('../package.json')
const Joi         = require('@hapi/joi')
const dotenv      = require('dotenv').config()

function clearURI(uri) {
    return uri.split('@')[1]
}

if (process.argv.length > 2 && fs.existsSync(`${process.argv[2]}`)) { // HACER: Generar control para el nombre de archivo.
    confFile = `${process.argv[2]}`
}

const NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'production'

const {string, number, array} = Joi.types();
const internals = {
    tlsOptions: Joi.object({
        key : string.required(),
        cert: string.required()
    }),
    envShema: Joi.object({
        CONFIG_FILE        : string.required(),
        PORT               : number.port(),
        DB_USER            : string,
        DB_PASS            : string,
        MAIL_USER          : string,
        MAIL_PASS          : string,
        AUTH_SRC           : string,
        MP_PROD_ACCESSTOKEN: string,
        MP_PROD_PUBLICKEY  : string,
        MP_TEST_ACCESSTOKEN: string,
        MP_TEST_PUBLICKEY  : string,
    }).unknown()
}

Joi.assert(process.env, internals.envShema)

module.exports = {
    name: 'configLoader',
    read() {
        const confFile = `${process.env.CONFIG_FILE}.js`
        const fileOK = fs.existsSync(confFile)
        Hoek.assert(fileOK, "Configuration file don't exists!")
        const config = require(`../${confFile}`)
        
        config.NODE_ENV = NODE_ENV
        config.version  = packagejson.version
        config.file     = confFile
        config.tls      = false
        config.server.port = process.env.PORT || config.server.port || 80

        if (config.server.useTls || false) {
            Joi.assert(config.certificate, internals.tlsOptions)
            const keyFile = fs.existsSync(`.${config.certificate.key}`)
            Hoek.assert(keyFile, "TLS Key file don't exists!")
            const certFile = fs.existsSync(`.${config.certificate.cert}`)
            Hoek.assert(certFile, "TLS Certificate file don't exists!")
            const key = fs.readFileSync(`.${config.certificate.key}`)
            const cert = fs.readFileSync(`.${config.certificate.cert}`)
            config.tls = {
                key,
                cert
            }
        }

        return config
    },
}