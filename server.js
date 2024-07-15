'use strict'

const Glue     = require('@hapi/glue')    // Server composer
const Mustache = require('mustache')      // View engine
const vision   = require('@hapi/vision')  // View hadler
const inert    = require('@hapi/inert');  // Statics routes handler

// const apiPattern     = /^[^\/].*[^\/]$/;
module.exports = {
    async init(config) {
        const manifest = {
            server: {
                port  : config.server.port,
                debug : (config.NODE_ENV == 'development') ? { request: ['handler'] }: {},
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
                        plugin : require('./plugins/b1ErrMng'),
                        options: {
                            doLog: true
                        }
                    },
                    {// 🚨 REQUIRED FOR ORTHER PLUGINS must to be second
                        plugin : require('./plugins/b1routerRegister'),
                        options: {
                            rootAPI: config.server.rootAPI,
                        },
                    },
                    { // AUTH
                        plugin : require('./plugins/auth'),
                        options: {
                            modelToken: config.security.modelToken,
                            modelUser : config.security.modelUser,
                        }
                    },
                    { // MongoDB
                        plugin : require('hapi-mongodb'),
                        options: config.mongoConfig
                    },
                    { // REST
                        plugin : require('./plugins/b1MongoRest'),
                        options: {
                            api    : require(config.dataSource.defFile),
                            path   : config.dataSource.path,
                            verbose: config.server.verbose,
                            dbList : config.dbList
                        }
                    },
                    { // User Mangment
                        plugin : require('./plugins/userManagment'),
                        options: {
                            modelUser              : config.security.modelUser,
                            modelToken             : config.security.modelToken,
                            path                   : config.security.pathAPI,
                            connection             : config.security.connection,
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
                            subjectRegister        : config.messages.subjectRegister,
                            emailVerificationCode  : config.views.emailVerificationCode,
                            formChkVerificationCode: config.views.formChkVerificationCode,
                            formChangePass         : config.views.formChangePass,
                            formChgPassByCode      : config.views.formChgPassByCode,
                            proxyURL               : config.server.proxyURL
                        }
                    },
                    { // hacli
                        plugin : require('@antoniogiordano/hacli'),
                        options: {}
                    },
                    { // b1csvfy
                        plugin: require('./plugins/b1csvfy')
                    },
                    { // tools routes
                        plugin : require('./plugins/toolsRoutes'),
                        options: {
                            path: config.server.toolsAPI,
                        },
                    },
                    { // file sotorage
                        plugin : require('./plugins/b1FileStorage'),
                        options: {
                            path      : '/store',
                            storage   : '../storage',
                            sysRoot   : config.sysRoot,
                            autoCreate: false,
                        },
                    },
                    { // webSocket
                        plugin : require('./plugins/webSocket'),
                        options: {
                        }
                    },
                    { // Telnet
                        plugin : require('./plugins/telnet'),
                        options: config.telnet
                    }
                    // {
                    //     plugin: require('./plugins/b1ShellExec'),
                    //     options: {
                    //         path: '/shell',
                    //         scriptPath: '../scripts',
                    //         sysRoot: config.sysRoot,
                    //     },
                    // },
                ],
            }
        }

        if (config.server.sendMails) {
            manifest.register.plugins.push(
                {
                    plugin : require('./plugins/b1nodemailer'),
                    options: {
                        service         : config.mail.service,
                        host            : config.mail.host,
                        port            : config.mail.port,
                        secureConnection: false,               // TLS requires secureConnection to be false
                        // secure: config.mail.secure,
                        // tls: {
                        //     ciphers: "SSLv3",
                        //     rejectUnauthorized: false,
                        // },
                        auth  : {
                            user: process.env.MAIL_USER,
                            pass: process.env.MAIL_PASS
                        }
                    }
                },
                /*{
                    plugin: require('./plugins/b1nodemailer'),
                    options: {
                        service: 'gmail',
                        auth: {
                            type        : 'OAuth2',
                            user        : process.env.MAIL_USER,
                            pass        : process.env.MAIL_PASS,
                            clientId    : process.env.OAUTH_CLIENTID,
                            clientSecret: process.env.OAUTH_CLIENT_SECRET,
                            refreshToken: process.env.OAUTH_REFRESH_TOKEN
                        }
                    }
                }*/
            )
        }

        const server = await Glue.compose(manifest /* ,options */ );

        await server.register(vision)
        server.views({
            engines: {
                html: {
                    compile: function (template) {
                        Mustache.parse(template);
                        return function (context) {
                            return Mustache.render(template, context);
                        };
                    }
                }
            },
            relativeTo: __dirname,
            path      : config.server.viewsPath
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
