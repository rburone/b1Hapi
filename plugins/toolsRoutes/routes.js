'use strict'
const Boom       = require('@hapi/boom')
const {generate} = require('../../lib/methods').b1Lib

module.exports = [
    {
        method: 'GET',
        path: '',
        options: {
            auth: false
        },
        handler: () => {
            return 'Bur1 Hapi\'s Server';
        }
    },
    {
        method: 'GET',
        path: '/config',
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
        method: 'GET',
        path: '/testDB',
        options: {
            plugins: {
                hacli: {
                    permission: 'USER'
                }
            }
        },
        handler: async (req) => {
            const db = req.mongo.db
            try {
                const result = await db.command({
                    dbStats: 1,
                    // listCollections: 1
                })
                return result
            } catch (err) {
                throw Boom.internal('Internal MongoDB error', err)
            }
        }
    },
    {
        method: 'GET',
        path: '/init_server',
        options: {
            auth: false
        },
        handler: async (req) => {
            const config = req.server.methods.getConf()
            const code = generate(6)
            const superUser = {
                _id: 'super@bur1.com',
                password: '*',
                emailVerified: true,
                roles: config.userManagment.roles,
                validationCode: code
            }
            const db = req.mongo.db
            try {
                const result = await db.collection(config.userManagment.modelUser).insertOne(superUser)
                if (result.insertedId) {
                    return {superUser}
                }
            } catch (error) {
                if (error.code == 11000) {
                    return 'Server was initialized before'
                } else {
                    throw Boom.internal('Internal MongoDB error', error)
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/submit',
        options: {
            auth: false,
            payload: {
                // maxBytes: 209715200,
                parse: true,
                allow: "multipart/form-data",
                multipart: {output: "file"},
            },
        },
        handler: async (req, h) => {
            console.log(req.payload);
            return h.response(req.payload);
        }
    },
]