'use strict'
const Boom = require('@hapi/boom')
const fs   = require('fs')
const {Server} = require('http')
const Joi  = require('joi')

function handler(r,h) {
    console.log(this.sysStorePath)
}

module.exports = [
    {
        method: 'GET',
        path: '',
        options: {
            auth: false
        },
        handler: () => {
            return 'Bur1 Storage';
        }
    },
    {
        method: 'POST',
        path: '/upload',
        options: {
            auth: false,
            payload: {
                // maxBytes: 209715200,
                parse: true,
                allow: "multipart/form-data",
                multipart: {output: "file"},
            },
        },
        handler: async function(req, h) {
            const incoming = req.payload
            Object.keys(req.payload).forEach(key => {
                if (typeof(incoming[key] == 'object')) {
                    try {
                        fs.rename(incoming[key].path, `${this.sysStorePath}/${incoming[key].filename}`, (err) => {
                        })
                    } catch (error) {
                        if (error) {
                            console.log(this.errManager({error, from: `[plugin:b1FileStorage:upload]`}))
                            return false
                        }
                    }
                }
            })

            return h.response(req.payload);
        }
    },
]