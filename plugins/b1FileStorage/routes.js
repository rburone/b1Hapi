'use strict'
const Boom     = require('@hapi/boom')
const fs       = require('fs')
const Joi      = require('joi')
const server = require('../../server')

function checkPath(destPath, create) {
    let out = true
    if (fs.existsSync(destPath)) {
        try {
            fs.accessSync(destPath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
            out = {error}
        }
    } else if (create) {
        try {
            fs.mkdirSync(destPath)
        } catch (error) {
            out = {error}
        }
    } else {
        const error = new Error(`No exists \x1b[1m${destPath}\x1b[0m storage`)
        // error.name = 'Error'
        error.code = 'ENOENT'
        out = {error}
    }

    return out
}


module.exports = [
    {
        method : 'GET',
        path   : '',
        options: {
            auth: false
        },
        handler: () => {
            return 'Bur1 Storage';
        }
    },
    {
        method : 'POST',
        path   : '/upload/{subdir?}',
        options: {
            auth   : false,
            payload: {
                // maxBytes: 209715200,
                parse    : true,
                allow    : "multipart/form-data",
                multipart: {output: "file"},
            },
        },
        handler: async function(req, h) {
            let result = true
            const incoming = req.payload

            Object.keys(incoming).forEach(key => {
                if (typeof(incoming[key]) == 'object') {
                    const {path, filename} = incoming[key]
                    let destPath = this.sysStorePath
                    
                    if (req.params.subdir) {
                        const check = checkPath(`${destPath}/${req.params.subdir}`, this.autoCreate)
                        if (check.error) {
                            result = this.errManager({error: check.error, from: '[plugin:b1FileStorage:subdir]'})
                        } else {
                            destPath = `${destPath}/${req.params.subdir}`
                        }
                    }

                    try {
                        fs.rename(path, `${destPath}/${filename}`, () => {
                            result = true
                        })
                    } catch (error) {
                        result = this.errManager({error, from: `[plugin:b1FileStorage:upload]`})
                    }
                }
            })

            return result;
        }
    },
]