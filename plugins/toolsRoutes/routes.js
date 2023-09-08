'use strict'
const Boom         = require('@hapi/boom')
const { generate } = require('../../lib/methods').b1Lib
const Joi          = require('joi')
const C            = require('../../lib/color_codes')

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
            // payload: {
            //     allow: 'application/json',
            //     parse: true
            // },
        },
        handler: function (req) {
            console.log(req.payload.data);
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
        path   : '/config',
        options: {
            auth: false
        },
        handler: (req) => {
            console.log('\n█▀▀ █▀█ █▄░█ █▀▀ █ █▀▀ █░█ █▀█ ▄▀█ ▀█▀ █ █▀█ █▄░█\n█▄▄ █▄█ █░▀█ █▀░ █ █▄█ █▄█ █▀▄ █▀█ ░█░ █ █▄█ █░▀█')
            const config = req.server.methods.getConf()
            Object.keys(config).forEach((key) => {
                console.log('\n │ %s │', key)
                console.table(config[key])
            })
            console.log('\n-------------------------------------------------------------------------------------\n')
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
                _id           : 'super_admin',
                password      : '*',
                emailVerified : true,
                roles         : config.acl.roles,
                validationCode: code
            }
            const db = req.mongo.db
            try {
                const result = await db.collection(config.security.modelUser).insertOne(superUser)
                if (result.insertedId) {
                    console.log(`${C.BgGreen+C.FgWhite}SERVER INITIALIZED!!${C.Reset}\n`)
                    return {superUser}
                }
            } catch (error) {
                if (error.code == 11000) {
                    console.log(`${C.BgRed + C.FgWhite}WARNING!! TRYING REINITIALIZE SERVER!!${C.Reset} ${new Date()}\n`)
                    return 'Server was initialized before'
                } else {
                    throw Boom.internal('Internal MongoDB error', error)
                }
            }
        }
    },
]
