'use strict'
// const Boom   = require('@hapi/boom')
const fs  = require('fs')
const Joi = require('joi')

function checkPath(destPath, create = false) {
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
        path   : '/{name*}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    name: string.required()
                })
            }
        },
        handler: function(req, h) {
            let result = false
            const path = req.params.name.split('/')
            const destPath = `${this.sysStorePath}/${path[0]}`
            const { error } = checkPath(destPath)
            if (error) {
                result = this.errManager({ error, from: `[plugin:b1FileStorage:get:path_NotFound] => ${destPath}` })
            } else {
                const file = `${destPath}/${path[1]}`
                console.log(file)
                // TODO: Cambiar por uso con buffer y no depender del plugin inert
                result = h.file(path[1], {
                    mode: "attachment",
                    filename: path[1],
                    confine: destPath //This is optional. provide only if the file is saved in a different location
                })
            }

            return result
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
        handler: async function(req) {
            let result = true
            const path = req.params.name.split('/')
            const destPath = `${this.sysStorePath}/${path[0]}`
            console.log('d', this, destPath)
            const {error} = checkPath(destPath, false)
            if (error) {
                result = this.errManager({error, from: `[plugin:b1FileStorage:path_NotFound] => ${destPath}`})
            } else {
                try {
                    const file = `${destPath}/${path[1]}`
                    fs.unlink(file, () => {
                        result = true
                    })
                } catch (error) {
                    result = this.errManager({error, from: `[plugin:b1FileStorage:delete] => ${file}`})
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
                const file = `${this.sysStorePath}/${filename}`
                fs.unlink(file, () => {
                    result = true
                })
            } catch (error) {
                result = this.errManager({error, from: `[plugin:b1FileStorage:delete:file] => ${file}`})
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
