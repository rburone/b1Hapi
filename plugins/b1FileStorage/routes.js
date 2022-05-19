'use strict'
const Boom   = require('@hapi/boom')
const fs     = require('fs')
const Joi    = require('joi')

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

const {string, number, boolean, array} = Joi.types();
module.exports = [
    {
        method : 'GET',
        path   : '/file/{name*}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    name: string.required()
                })
            }
        },
        handler: (req) => {
            console.log(req.params.name)
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
    {
        method: 'DELETE',
        path: '/{name*2}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    name: string.required()
                })
            }
        },
        handler: async function(req, h) {
            let result = true
            const path = req.params.name.split('/')
            const destPath = `${this.sysStorePath}/${path[0]}`
            const {error} = checkPath(destPath, false)
            if (error) {
                result = this.errManager({error, from: '[plugin:b1FileStorage:file_delete]'})
            } else {
                try {
                    fs.unlink(`${destPath}/${path[1]}`, () => {
                        result = true
                    })
                } catch (error) {
                    result = this.errManager({error, from: `[plugin:b1FileStorage:upload]`})
                }
            }
            return result;
        }
    },
    {
        method: 'DELETE',
        path: '/{filename}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    filename: string.required()
                })
            }
        },
        handler: async function(req, h) {
            let result = true
            const filename = req.params.filename
            try {
                fs.unlink(`${this.sysStorePath}/${filename}`, () => {
                    result = true
                })
            } catch (error) {
                result = this.errManager({error, from: `[plugin:b1FileStorage:delete:file]`})
            }
            
            return result;
        }
    },
    {
        method: 'DELETE',
        path: '/dir/{name}',
        options: {
            auth: false,

        },
        handler: async function(req, h) {
            let result = true
            const incoming = req.payload

            Object.keys(incoming).forEach(key => {
                if (typeof (incoming[key]) == 'object') {
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