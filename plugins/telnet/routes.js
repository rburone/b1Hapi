const Joi      = require('joi')
const net      = require('net')
const Boom     = require('@hapi/boom')
const say      = require('../../lib/console_helper')
const b1Socket = require('./b1Socket.js')
const telnet   = new b1Socket(new net.Socket())

const { string, number, boolean, array } = Joi.types();
module.exports = [
    {
        method: 'GET',
        path: '/connect/{ip}/{port}',
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    ip: string.pattern(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).required(),
                    port: number.integer().required(),
                })
            }
        },
        handler: async req => {
            const ip     = req.params.ip
            const port   = req.params.port

            try {
                await telnet.connect(port, ip)
                say('tell', 'Telnet', `Connected to ${ip}:${port}`)
                return 'ok'
            } catch (error) {
                say('error', error.code, `${ip}:${port}`, '[plugin:telnet:connect]')
                if (error.code == 'ETIMEDOUT') {
                    return Boom.gatewayTimeout()
                }
                return Boom.internal()
            }
        }
    },
    {
        method: 'GET',
        path: '/close',
        options: {
            auth: false
        },
        handler: req => {
            say('tell', 'Telnet', `Close ${telnet.ip}:${telnet.port}`)
            telnet.client.destroy()
            return 'ok'
        }
    },
    {
        method: 'GET',
        path: '/send/{cmd}',
        options: {
            auth: false
        },
        handler: async req => {
            const cmd = req.params.cmd
            say('tell', 'Telnet', `Send ${cmd}`)
            try {
                const response = await telnet.send(cmd)
                return response
            } catch (error) {
                return error
            }
        }
    },
]
