'use strict'
// const Boom   = require('@hapi/boom')
// const fs     = require('fs')
const Joi      = require('joi')
const { exec } = require("child_process");

function execute(path, script) {
    return new Promise((resolve, reject) => {
        exec(`node ${path}/${script}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(`error: ${error.message}`)
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject(`stderr: ${stderr}`)
            }
            resolve(stdout);
        });
    })

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
        handler: async function (req) {
            const response = await execute(this.sysScriptPath, req.params.name)
            return `Bur1 Shell ${req.params.name, response}`
        }
    },
    {
        method : 'POST',
        path   : '/{name*}',
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
                    let destPath = this.sysScriptPath
                }
            })

            return result;
        }
    },
]
