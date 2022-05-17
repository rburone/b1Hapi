'use strict'

const Glue   = require('@hapi/glue')    // Server composer
const ejs    = require('ejs')           // View engine
const vision = require('@hapi/vision')  // View hadler
const inert  = require('@hapi/inert');  // Statics routes handler
const Joi    = require('@hapi/joi')

const apiPattern = /^[^\/].*[^\/]$/
module.exports = {
    async init (config) {
        const {string, number, boolean} = Joi.types();
        const ConfigServerSchema = Joi.object({
            port      : number.port().allow('').required(),
            host      : string.required(),
            publicPath: string.allow('').required(),
            rootAPI   : string.allow('').pattern(apiPattern, "Don't start with /").required(),
            userAPI   : string.allow('').pattern(apiPattern, "Don't start with /").required(),
            toolsAPI  : string.allow('').pattern(apiPattern, "Don't start with /").required(),
            viewsPath : string.pattern(apiPattern, "Don't start with /").required(),
            useTls    : boolean.required(),
            sendMails : boolean.required(),
            verbose   : boolean,
            customData: string.required()
        })
        Joi.assert(config.server, ConfigServerSchema)

        const manifest = {
            server: {
                port  : config.server.port,
                debug : (config.NODE_ENV == 'development') ? {request: ['handler']}: {},
                tls   : config.tls,
                routes: {
                    cors : true,
                    files: {
                        relativeTo: config.server.publicPath
                    }
                },
            },
            register: {
                plugins: [
                    {// 🚨 REQUIRED FOR ORTHER PLUGINS must to be first
                        plugin: require('./plugins/b1ErrMng'),
                        options: {
                            doLog: true
                        }
                    },
                    {// 🚨 REQUIRED FOR ORTHER PLUGINS must to be second
                        plugin: require('./plugins/b1routerRegister'),
                        options: {
                            rootAPI: config.server.rootAPI,
                        },
                    },
                    {
                        plugin: require('./plugins/auth'),
                        options: {
                            modelToken: config.security.modelToken,
                            modelUser : config.security.modelUser,
                        }
                    },
                    {
                        plugin: require('hapi-mongodb'),
                        options: {
                            url: config.dataBase.url,
                            settings: {
                                auth: {
                                    username  : process.env.DB_USER,
                                    password  : process.env.DB_PASS,
                                    authSource: process.env.AUTH_SRC,
                                },
                                useUnifiedTopology: true,
                            },
                            decorate: true
                        }
                    },
                    {
                        plugin: require('./plugins/b1MongoRest'),
                        options: {
                            api    : require(config.dataBase.defFile),
                            path   : config.dataBase.path,
                            verbose: config.server.verbose,
                        }
                    },
                    {
                        plugin: require('./plugins/userManagment'),
                        options: {
                            modelUser              : config.security.modelUser,
                            modelToken             : config.security.modelToken,
                            path                   : config.server.userAPI,
                            passMinLen             : config.security.passMinLen,
                            verifyEmail            : config.security.verifyEmail,
                            ttl                    : config.security.ttl,
                            lenVerifCode           : config.security.lenVerifCode,
                            roles                  : config.acl.roles,
                            userAdmin              : config.acl.userAdmin,
                            fromEmail              : config.mail.fromEmail,
                            secureChange           : config.security.secureChange,
                            oneTimeCode            : config.security.oneTimeCode,
                            sendMails              : config.server.sendMails,
                            emailVerificationCode  : config.views.emailVerificationCode,
                            formChkVerificationCode: config.views.formChkVerificationCode,
                            formChangePass         : config.views.formChangePass,
                        }
                    },
                    {
                        plugin: require('@antoniogiordano/hacli'),
                        options: {}
                    },
                    {
                        plugin: require('disinfect'),
                        options: {
                            disinfectQuery  : true,
                            disinfectParams : true,
                            disinfectPayload: true
                        }
                    },
                    {
                        plugin: require('./plugins/b1csvfy')
                    },
                    {
                        plugin: require('./plugins/toolsRoutes'),
                        options: {
                            path: config.server.toolsAPI,
                        },
                    },
                    {
                        plugin: require('./plugins/b1FileStorage'),
                        options: {
                            path      : '/store',
                            storage   : '../storage',
                            sysRoot   : config.sysRoot,
                            autoCreate: false,
                        },
                    },
                ],
            }
        }

        if (config.server.sendMails) {
            manifest.register.plugins.push(
                {
                    plugin: require('./plugins/b1nodemailer'),
                    options: {
                        host: config.mail.host,
                        port: config.mail.port,
                        auth: {
                            user: config.mail.user,
                            pass: config.mail.pass
                        }
                    }
                },
            )
        }

        const server = await Glue.compose(manifest/*, options*/);

        await server.register(vision)
        server.views({
            engines: {ejs},
            relativeTo: __dirname,
            path: config.server.viewsPath
        })

        if (config.server?.publicPath.length > 0) {
            await server.register(inert)
            await server.route(require('./router/static-routes.js'))
        }
        
        // █▄ ▄█ ██▀ ▀█▀ █▄█ ▄▀▄ █▀▄ ▄▀▀
        // █ ▀ █ █▄▄  █  █ █ ▀▄▀ █▄▀ ▄█▀
        server.method('getConf', (seccion = false) => {
            if (seccion) {
                return config[seccion]
            }
            return config
        })

        await server.start()
        
        return server
    }
}