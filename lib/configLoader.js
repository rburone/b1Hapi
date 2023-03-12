'use strict'
const fs          = require('fs')
const path        = require('path')
const Hoek        = require('@hapi/hoek')
const packagejson = require('../package.json')
const Joi         = require('joi')
const CODE        = require('../lib/color_codes')
const dotenv      = require('dotenv').config()

function validate(schema, data) {
    let { value, error } = schema.validate(data)
    if (error) {
        error.details.forEach(err => {
            let msg = err.type.split('.')[1]
            if (err.context.name) {
                msg = `${CODE.FgRed}${err.context.value}${CODE.Reset} ${err.context.name}`
            }
            console.log(`${CODE.BgRed + CODE.FgWhite} CONFIG ERROR ${CODE.BgYellow + CODE.FgBlack} ${err.context.label} ${CODE.Reset}: ${msg}`)
        });
        console.log(`\n${CODE.BgYellow}${CODE.FgRed} --- ASSERTION ERROR: SERVER CAN'T START ---${CODE.Reset}\n`)
        process.exit(1)
    } else return value
}

function generateMongoConfig(dataSource) {
    const mongoConfig = []
    const indxDB = {}
    dataSource.conections.forEach((cData, n) => {
        const conConfig = {
            url: cData.uri,
            settings: {
                auth: {
                    username: process.env[`DB_USER_${cData.name}`],
                    password: process.env[`DB_PASS_${cData.name}`],
                    // authSource: '',
                },
                useUnifiedTopology: true,
            },
            decorate: true
        }
        indxDB[cData.name] = n
        mongoConfig.push(conConfig)
    })
    return {mongoConfig, indxDB}
}

function generateModelTree(modelRaw) {
    const tree = {}
    modelRaw.forEach(model => {
        if (!tree[model.name]) {
            tree[model.name] = {
                dataSource: model.dataSource,
                actions: model.actions
            }
        } else {
            console.log(`${CODE.BgRed + CODE.FgWhite} CONFIG ERROR ${CODE.BgYellow + CODE.FgBlack} ${model.name} ${CODE.Reset}: model is duplicated!`)
            console.log(`\n${CODE.BgYellow}${CODE.FgRed} --- FATAL ERROR: SERVER CAN'T START ---${CODE.Reset}\n`)
            process.exit(1)
        }
    })
    return tree
}

const NODE_ENV   = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'production'
const apiPattern = /^[^\/].*[^\/]$/;

const { string, number, array, boolean } = Joi.types();

const conectionSchema = Joi.object({
    name: string.required(),
    uri: string.uri().required()
})

const configuration = Joi.object({
    server: {
        port      : number.port().allow('').required(),
        host      : string.default('localhost'),
        publicPath: string.allow('').required(),
        rootAPI   : string.allow('').pattern(apiPattern, "Don't start with /").required(),
        userAPI   : string.allow('').pattern(apiPattern, "Don't start with /").required(),
        toolsAPI  : string.allow('').pattern(apiPattern, "Don't start with /").required(),
        viewsPath : string.pattern(apiPattern, "Don't start with /").required(),
        useTls    : boolean.required(),
        sendMails : boolean.required(),
        verbose   : boolean,
        customData: string.required()
    },
    acl: {
        roles    : array.items(string).default(['SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST']),
        userAdmin: string.default('ADMIN')
    },
    views: {
        emailVerificationCode  : string.default('email_code'),
        formChkVerificationCode: string.default('form_verify_code'),
        formChangePass         : string.default('form_change_pass'),
    },
    security: {
        modelToken  : string.required(),
        modelUser   : string.required(),
        verifyEmail : boolean.default(false),
        ttl         : number.default(1209600),
        passMinLen  : number.default(8),
        lenVerifCode: number.default(6),
        oneTimeCode : boolean.default(true),
        secureChange: boolean.default(false)
    },
    dataSource: {
        defFile   : string.required(),
        path      : string.required(),
        conections: array.items(conectionSchema).required()
    }
}).unknown()

const tlsOptions = Joi.object({
    key : string.required(),
    cert: string.required()
})

const envSchema = Joi.object({
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

const ACLSchema = Joi.object({
    name       : string.required(),
    permissions: array.required(),    // TODO: View if posible validates width config.acl.roles [11/03/2023]
})

const modelSchema = array.items({
    name      : string.required(),
    dataSource: string.required(),
    actions   : array.items(ACLSchema).required()
})

validate(envSchema, process.env)

module.exports = {
    name: 'configLoader',
    read() {
        const confFile = `${process.env.CONFIG_FILE}.js`
        const fileOK = fs.existsSync(confFile)
        Hoek.assert(fileOK, "Configuration file don't exists!")
        const configRaw = require(`../${confFile}`)

        configRaw.NODE_ENV = NODE_ENV
        configRaw.version  = packagejson.version
        configRaw.file     = confFile
        configRaw.tls      = false
        configRaw.sysRoot  = path.normalize(`${__dirname}/..`)
        configRaw.server.port = process.env.PORT || configRaw.server.port

        const config = validate(configuration, configRaw)

        const defFile = `${config.server.customData}/models.js`
        const defFileOK = fs.existsSync(defFile)
        Hoek.assert(defFileOK, "Models file don't exists!")
        const modelRaw = require(`${defFile}`)
        validate(modelSchema, modelRaw)

        config.models = generateModelTree(modelRaw)

        const { mongoConfig, indxDB } = generateMongoConfig(config.dataSource)
        config.mongoConfig = mongoConfig
        config.indxDB = indxDB

        if (config.server.useTls || false) {
            tlsOptions.validate(tlsOptions, config.certificate)

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
