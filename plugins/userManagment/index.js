'use strict'
const usrMng     = require('./lib')
const Joi        = require('joi')
const Hoek       = require('@hapi/hoek');

const {string, number, boolean, array} = Joi.types();
const internals = {
    defaults: {
        path                   : '',
        passMinLen             : 8,
        verifyEmail            : false,
        ttl                    : 1209600,
        lenVerifCode           : 6,
        oneTimeCode            : true,
        secureChange           : false,
        userAdmin              : 'ADMIN',
        roles                  : ['SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST'],
        emailVerificationCode  : 'email_code',
        formChkVerificationCode: 'form_verify_code',
        formChangePass         : 'form_change_pass',
    },
    schema: Joi.object({
        modelUser : string.required(),
        modelToken: string.required(),
        fromEmail : string.email().required(),

        path                   : string.allow(''),
        passMinLen             : number.integer(),
        verifyEmail            : boolean,
        ttl                    : number,
        lenVerifCode           : number,
        oneTimeCode            : boolean,
        secureChange           : boolean,
        userAdmin              : string,
        roles                  : array,
        sendMails              : boolean,
        emailVerificationCode  : string,
        formChkVerificationCode: string,
        formChangePass         : string,
    })
};

module.exports = {
    name: 'userManagment',
    register(server, options) {
        const settings = Hoek.applyToDefaults(internals.defaults, options);
        server.assert(Joi.assert, options, internals.schema, '[plugin:userManagment:register]');
        server.assert(Joi.assert, {userAdmin: settings.userAdmin}, Joi.object({userAdmin: string.valid(...settings.roles)}), '[plugin:userManagment:register]')

        const routes = [
            { // LOGIN user
                method: 'POST',
                path: '/login',
                options: {
                    auth: false,
                    validate: {
                        payload: Joi.object({
                            email   : string.email().required(),
                            password: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const modelToken = db.collection(settings.modelToken)

                    const conditions = {
                        verifyEmail: settings.verifyEmail,
                        ttl        : settings.ttl
                    }

                    const result = await usrMng.checkUser(modelUser, modelToken, req.payload, conditions)
                    if (!result.error) {
                        delete result.code // Delete validation code from response
                        return result
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:login]`})
                    }
                }
            },
            { // LOGOUT user
                method: 'GET',
                path: '/logout',
                // options: {
                //     auth: true,
                // },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelToken = db.collection(settings.modelToken)
                    const token = req.auth.credentials.token

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
                method: 'GET',
                path: '/sendCode/{email}',
                options: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            email: string.email().required()
                        })
                    }
                },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const data = {
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
                method: 'PATCH',
                path: '/setPassword',
                options: {
                    auth: false,
                    validate: {
                        payload: Joi.object({
                            email   : string.email().required(),
                            code    : string.length(settings.lenVerifCode).required(),
                            password: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const result = await usrMng.chkVerificationCode(modelUser, req.payload.email, req.payload.code, settings.oneTimeCode)

                    if (!result.error) {
                        if (result == 'ok') {
                            const updResult = await usrMng.updatePass(db.collection(settings.modelUser), req.payload.email, req.payload.password)
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
                method: 'PATCH',
                path: '/changePassword',
                options: {
                    auth: settings.secureChange,
                    validate: {
                        payload: Joi.object({
                            email : string.email().required(),
                            new   : string.min(settings.passMinLen).required(),
                            actual: string.min(settings.passMinLen).required(),
                        })
                    }
                },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)

                    const result = await usrMng.checkPassword(modelUser, req.payload.email, req.payload.actual)

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
                method: 'GET',
                path: '/chkCode',
                options: {
                    auth: false,
                    validate: {
                        query: Joi.object({
                            email: string.email().required(),
                            code : string.length(settings.lenVerifCode).required()
                        })
                    }
                },
                handler: async (req) => {
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const result = await usrMng.chkVerificationCode(modelUser, req.params.email, req.params.code)

                    if (!result.error) {
                        return (result == 'ok') ? 'ok' : 'invalid'
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:chkCode]`})
                    }
                }
            },
            { // Delete user
                method: 'DELETE',
                path: '/{email}',
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
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const email = req.params.email
                    const result = await usrMng.delete(modelUser, email)

                    if (!result.error) {
                        return result
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:delete]`})
                    }
                }
            },
            { // Create a new user
                method: 'POST',
                path: '/user',
                options: {
                    validate: {
                        payload: Joi.object({
                            password: string.min(settings.passMinLen).required(),
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
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)
                    const data = {
                        _id          : req.payload.email,
                        password     : req.payload.password,
                        roles        : req.payload.roles,
                        emailVerified: !settings.verifyEmail,
                        lenVerifCode : settings.lenVerifCode
                    }

                    const result = await usrMng.create(modelUser, data)

                    if (!result.error) {
                        if (settings.verifyEmail && settings.sendMails) {
                            const mail = await server.render(settings.emailVerificationCode, {
                                code: user.validationCode
                            });

                            const info = await server.methods.sendEmail({
                                from   : settings.fromEmail,
                                to     : user._id,
                                subject: 'Register OK',
                                html   : mail
                            })

                            if (info.error) {
                                return server.errManager(info)
                            }
                        }
                        return user.validationCode
                    } else {
                        return server.errManager({error: result.error, from: `[plugin:userManagment:create]`})
                    }
                }
            },
            { // Return validation code form
                method: 'GET',
                path: '/validationForm/{email?}',
                options: {
                    auth: false,
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
            { // Return change password form
                method: 'GET',
                path: '/changePassForm',
                options: {
                    auth: settings.secureChange, // If need to be logged in to change the password
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
                method: 'PATCH',
                path: '/roles',
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
                    const db = req.mongo.db
                    const modelUser = db.collection(settings.modelUser)

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
        ]

        routes.forEach(route => {
            route.path = `${settings.path}${route.path}`
        })

        server.createRoute(routes)
    }
}