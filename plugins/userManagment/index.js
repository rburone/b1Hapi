'use strict'
const usrMng       = require('./lib')
const Joi          = require('joi')
const bcrypt       = require('bcryptjs');
const { generate } = require('../../lib/methods').b1Lib

const { string, array } = Joi.types();

function getDbCollection(rq, connection = '', collection = '') {
    const idx = rq.server.methods.getConf('dbList')
    const db  = rq.mongo.db

    if (Object.keys(idx).length > 1) {
        const conNumer = idx[connection]
        return db[conNumer].collection(collection)
    } else {
        return db.collection(collection)
    }
}

module.exports = {
    name: 'userManagment',
    register(server, settings) {
        const routes = [
            { // LOGIN user
                method : 'POST',
                path   : '/login',
                options: {
                    auth    : false,
                    validate: {
                        payload: Joi.object({
                            email   : string.email().required(),
                            password: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const modelUser  = getDbCollection(req, settings.connection, settings.modelUser)
                    const modelToken = getDbCollection(req, settings.connection, settings.modelToken)

                    const conditions = {
                        verifyEmail: settings.verifyEmail,
                        ttl        : settings.ttl
                    }

                    const result = await usrMng.checkUser(modelUser, modelToken, req.payload, conditions)
                    if (!result.error) {
                        delete result.code  // Delete validation code from response
                        return result
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:login]`})
                    }
                }
            },
            { // LOGOUT user
                method: 'GET',
                path  : '/logout',
                  // options: {
                  //     auth: true,
                  // },
                handler: async (req) => {
                    const modelToken = getDbCollection(req, settings.modelToken)
                    const token      = req.auth.credentials.token

                      // const ObjectID = req.mongo.ObjectID;
                    const result = await usrMng.revokeToken(modelToken, token)
                    if (!result.error) {
                        return result
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:logout]`})
                    }
                }
            },
            { // Set and send random verification code
                method : 'GET',
                path   : '/sendCode/{email}',
                options: {
                    auth    : false,
                    validate: {
                        params: Joi.object({
                            email: string.email().required()
                        })
                    }
                },
                handler: async (req) => {
                    const db        = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const data      = {
                        email       : req.params.email,
                        lenVerifCode: settings.lenVerifCode
                    }
                    const code = await usrMng.setVerificationCode(modelUser, data)

                    if (!code.error) {
                        if (settings.sendMails) {
                            try {
                                const url  = `${settings.path}/validationForm`
                                const mail = await server.render(settings.emailVerificationCode, {code});

                                const status = await server.methods.sendEmail({
                                    from   : settings.fromEmail,
                                    to     : data.email,
                                    subject: 'Register OK',
                                    html   : mail
                                })

                                if (status.error) {
                                    return status.error
                                }

                                return status
                            } catch (error) {
                                return server.errManager({error, from: `[plugin:userManagment:emailRender]`})
                            }
                        } else {
                            return code
                        }
                    } else {
                        return server.errManager({error: code.error, from: `[plugin:userManagment:setVerificationCode]`})

                    }
                }
            },
            { // Set a password if verification code is valid
                method : 'POST',
                path   : '/setPassword',
                options: {
                    auth    : false,
                    validate: {
                        payload: Joi.object({
                            email   : string.email().required(),
                            code    : string.length(settings.lenVerifCode).required(),
                            password: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    const result    = await usrMng.chkVerificationCode(modelUser, req.payload.email, req.payload.code, settings.oneTimeCode)
                    if (!result.error) {
                        if (result == 'ok') {
                            const updResult = await usrMng.updatePass(modelUser, req.payload.email, req.payload.password)
                            if (!updResult.error) {
                                return updResult
                            } else {
                                return server.errManager({error: updResult.error, from: `[plugin:userManagment:updatePassword]`})
                            }
                        } else {
                            return 'unchanged'
                        }
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:setPassword]`})
                    }
                }
            },
            { // Change a password if actual password is valid
                method : 'POST',
                path   : '/changePassword',
                options: {
                    auth    : settings.secureChange,
                    validate: {
                        payload: Joi.object({
                            email : string.email().required(),
                            new   : string.min(settings.passMinLen).required(),
                            actual: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    const result    = await usrMng.checkPassword(modelUser, req.payload.email, req.payload.actual)

                    if (!result.error) {
                        if (result == 'ok') {
                            const updResult = await usrMng.updatePass(modelUser, req.payload.email, req.payload.new)
                            if (!updResult.error) {
                                return updResult
                            } else {
                                return server.errManager({error: updResult.error, from: `[plugin:userManagment:updatePassword]`})
                            }
                        } else {
                            return 'unchanged'
                        }
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:checkPassword]`})
                    }
                }
            },
            { // Check if is valid the verification code for user
                method : 'GET',
                path   : '/chkCode/{email}/{code}',
                options: {
                    auth    : false,
                    validate: {
                        params: Joi.object({
                            email: string.email().required(),
                            code : string.length(settings.lenVerifCode).required()
                        })
                    }
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    const result    = await usrMng.chkVerificationCode(modelUser, req.params.email, req.params.code)

                    if (!result.error) {
                        return (result == 'ok') ? 'ok': 'invalid'
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:chkCode]`})
                    }
                }
            },
            { // Delete user
                method : 'DELETE',
                path   : '/{email}',
                options: {
                    validate: {
                        params: Joi.object({
                            email: string.email().required()
                        }),
                    },
                    plugins: {
                        hacli: {
                            permission: settings.userAdmin
                        }
                    }
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    const email     = req.params.email
                    const result    = await usrMng.delete(modelUser, email)

                    if (!result.error) {
                        return result
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:delete]`})
                    }
                }
            },
            { // Create a new user
                method : 'POST',
                path   : '',
                options: {
                    validate: {
                        payload: Joi.object({
                            password: string.min(settings.passMinLen).required().allow('*'),
                            email   : string.email().required(),
                            roles   : array.items(string.valid(...settings.roles)).required()
                        })
                    },
                    plugins: {
                        hacli: {
                            permission: settings.userAdmin
                        }
                    }
                },
                handler: async (req) => {
                    const modelUser                  = getDbCollection(req, settings.connection, settings.modelUser)
                    const { email, password, roles } = req.payload
                    const cryptPass = password != '*' ? bcrypt.hashSync(password, 10) : '*'

                    const user = {
                        _id           : email,
                        password      : cryptPass,
                        roles         : roles,
                        validationCode: generate(settings.lenVerifCode),
                        emailVerified : !settings.verifyEmail,
                    }

                    const result = await usrMng.create(modelUser, user)

                    if (!result.error) {
                        if (settings.verifyEmail && settings.sendMails) {
                            const mail = await server.render(settings.emailVerificationCode, {
                                code: user.validationCode
                            });

                            const info = await server.methods.sendEmail({
                                from   : settings.fromEmail,
                                to     : user._id,
                                subject: settings.messages.subjectRegister || 'Register OK',
                                html   : mail
                            })

                            if (info.error) {
                                return server.errManager({ error: info.error, from: `[plugin:userManagment:create:sendmail:${email}]` })
                            }
                        }

                        return user.validationCode
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:create:${email}]`})
                    }
                }
            },
            { // Return validation code form
                method : 'GET',
                path   : '/validationForm/{email?}',
                options: {
                    auth    : false,
                    validate: {
                        params: Joi.object({
                            email: string.email()
                        })
                    }
                },
                handler: async (req) => {
                    try {
                        const form = await server.render(settings.formChkVerificationCode, {
                            lengthcode: settings.lenVerifCode,
                            url       : `${settings.path}/chkCode`,
                            email     : req.params.email
                        });
                        return form
                    } catch (error) {
                        return server.errManager({error, from: `[plugin:userManagment:validationForm]`})
                    }
                }
            },
            { // Return change password with valid code form
                method : 'GET',
                path   : '/changePassCodeForm/{email?}',
                options: {
                    auth    : false,
                    validate: {
                        params: Joi.object({
                            email: string.email()
                        })
                    }
                },
                handler: async (req) => {
                    try {
                        const form = await server.render(settings.formChgPassByCode, {
                            passMinLen: settings.passMinLen,
                            lengthcode: settings.lenVerifCode,
                            url       : `${settings.path}/setPassword`,
                            email     : req.params.email
                        });
                        return form
                    } catch (error) {
                        return server.errManager({ error, from: `[plugin:userManagment:changePassCodeForm]` })
                    }
                }
            },
            { // Return change password form
                method : 'GET',
                path   : '/changePassForm',
                options: {
                    auth: settings.secureChange,   // If need to be logged in to change the password
                },
                handler: async (req) => {
                    try {
                        const form = await server.render(settings.formChangePass, {
                            passMinLen: settings.passMinLen,
                            url       : `${settings.path}/changePassword`
                        });
                        return form
                    } catch (error) {
                        return server.errManager({error, from: `[plugin:userManagment:changePassForm]`})
                    }
                }
            },
            { // Set/unset roles to user
                method : 'PATCH',
                path   : '/roles',
                options: {
                    validate: {
                        payload: Joi.object({
                            email: string.email().required(),
                            roles: array.items(string.valid(...settings.roles)).required()
                        })
                    },
                    plugins: {
                        hacli: {
                            permission: settings.userAdmin
                        }
                    }
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)

                    const userData = {
                        _id  : req.payload.email,
                        roles: req.payload.roles
                    }

                    const result = await usrMng.update(modelUser, userData)

                    if (!result.error) {
                        if (result == 'ok') {
                            return 'ok'
                        } else {
                            return 'unchanged'
                        }
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:update]`})
                    }
                }
            },
            { // LIST of users
                method : 'GET',
                path   : '',
                options: {
                    plugins: {
                        hacli: {
                            permission: settings.userAdmin
                        }
                    },
                },
                handler: async (req) => {
                    const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    const filter = {}
                    const result = await usrMng.find(modelUser)
                    return result
                }
            },
            { // LIST of rols
                method: 'GET',
                path: '/roles',
                options: {
                    plugins: {
                        hacli: {
                            permission: settings.userAdmin
                        }
                    },
                },
                handler: async (req) => {
                    // const modelUser = getDbCollection(req, settings.connection, settings.modelUser)
                    // const filter = {}
                    const result = server.methods.getConf('acl').roles
                    return result
                }
            }
        ]

        routes.forEach(route => {
            route.path = `/${settings.path}${route.path}`
        })

        server.createRoute(routes)
    }
}
