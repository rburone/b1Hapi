'use strict'
// const Boom   = require('@hapi/boom')
// const fs     = require('fs')
const Joi      = require('joi')
const { exec, spawn } = require("child_process");

function execute(path, script) {
    return new Promise((resolve, reject) => {
        exec(`${path}/${script}`, (error, stdout, stderr) => {
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

function execcuter(path, script) {
    // const ps = spawn('sh', [`${path}/${script}`, req.body.code]);
    const ps = spawn('sh', [`${path}/${script}`, req.body.code]);
    ps.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ps.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ps.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        return code
    });

    // echo incoming data to test whether POST request works
    // res.status(200).json({ myReply: req.body.code });
    // return code
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
        handler: async function (req, h) {
            const response = await execute(this.sysScriptPath, req.params.name)
            // const response = await exec(this.sysScriptPath, req.params.name)
            return h.response(response).header('Content-Disposition','inline').header('Content-type','image/jpg');
            // return response
            // return `Bur1 Shell ${req.params.name, response}`
        }
    },
    {
        method : 'GET',
        path   : '/img/{name*}',
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
        method : 'GET',
        path   : '/node/{name*}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    name: string.required()
                })
            }
        },
        handler: async function (req) {
            const response = await execute('node', this.sysScriptPath, req.params.name)
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
