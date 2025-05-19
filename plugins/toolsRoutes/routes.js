'use strict'
const Boom         = require('@hapi/boom')
const { generate } = require('../../lib/methods').b1Lib
const Joi          = require('joi')

require('../../lib/b1-colorString')
const { string, boolean, array } = Joi.types();

  // const handler = function(r,h) {
  //     console.log(this.marco, h.context.marco)
  //     return this.marco
  // }

module.exports = [
    {
        method: 'POST',
        path: '',
        options: {
            auth: false,
            // validate: {
            //     payload: Joi.object({
            //         // email   : string.email({ tlds: { allow: false } }).required()
            //         nombre: string.required()
            //         // data    : responsableSchema
            //     })
            // },
        },
        handler: function (req) {
            console.log(req.payload);
            return 'Bur1 Hapi\'s Server Test';
        }
    },
    {
        method : 'GET',
        path   : '',
        options: {
            auth: false
        },
        handler: function() {
            return 'Bur1 Hapi\'s Server';
        }
    },
    {
        method : 'GET',
        path   : '/acl/roles',
        options: {
            auth: false
        },
        handler: (req) => {
            const config = req.server.methods.getConf()
            return { 'roles': config.acl.roles }
        }
    },
    {
        method : 'GET',
        path   : '/config',
        options: {
            auth: false
        },
        handler: (req) => {
            let config = 'ERROR'
            if (process.env.NODE_ENV == 'development') {
                console.log('\n█▀▀ █▀█ █▄░█ █▀▀ █ █▀▀ █░█ █▀█ ▄▀█ ▀█▀ █ █▀█ █▄░█\n█▄▄ █▄█ █░▀█ █▀░ █ █▄█ █▄█ █▀▄ █▀█ ░█░ █ █▄█ █░▀█')
                config = req.server.methods.getConf()
                Object.keys(config).forEach((key) => {
                    console.log('\n │ %s │', key)
                    console.table(config[key])
                })
                console.log('\n-------------------------------------------------------------------------------------\n')
            }
            return config
        }
    },
    {
        method : 'GET',
        path   : '/testDB/{n?}',
        options: {
            // auth: false
            plugins: {
                hacli: {
                    permission: '*'
                }
            }
        },
        handler: async (req) => {
            const db = req.mongo.db
            if (Array.isArray(db)) {
                const idx = req.params.n ? req.params.n : 0
                const con = db[idx]
                try {
                    const result = await con.command({
                        dbStats: 1,
                        // listCollections: 1
                    })
                    // console.log(con.s.namespace.db, 'OK')
                    return result
                } catch (err) {
                    throw Boom.internal('Internal MongoDB error', err)
                }
            } else {
                try {
                    const result = await db.command({
                        dbStats: 1,
                        // listCollections: 1
                    })
                    // console.log(con.s.namespace.db, 'OK')
                    return result
                } catch (err) {
                    throw Boom.internal('Internal MongoDB error', err)
                }
            }
        }
    },
    {
        method : 'GET',
        path   : '/init_server',
        options: {
            auth: false
        },
        handler: async (req) => {
            const config = req.server.methods.getConf()

            const code      = generate(6)
            const superUser = {
                _id           : 'super@bur1.com',
                password      : '*',
                emailVerified : true,
                roles         : config.acl.roles,
                validationCode: code
            }
            const db = req.mongo.db
            try {
                const result = await db.collection(config.security.modelUser).insertOne(superUser)
                if (result.insertedId) {
                    console.log(`SERVER INITIALIZED!!\n`.BgGreen.FgWhite)
                    return {superUser}
                }
            } catch (error) {
                if (error.code == 11000) {
                    console.log(`${'WARNING!! TRYING REINITIALIZE SERVER!!'.BgRed.FgWhite} ${new Date()}\n`)
                    return 'Server was initialized before'
                } else {
                    throw Boom.internal('Internal MongoDB error', error)
                }
            }
        }
    },
]
