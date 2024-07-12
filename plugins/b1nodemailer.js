'use strict'
/******************************************************
* b1nodemailer.js
* Create a server method to send emails using nodemailer
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*
* server.sendEmail({
*    from,
*    to,
*    subject,
*    text,
*    html
* })
*/
const nodemailer = require('nodemailer');
const Joi        = require('joi');
require('../lib/b1-colorString')

const {string, number, boolean} = Joi.types();
const OptionsSchema = Joi.object({
    service: string.required(),
    // host   : string.required(),
    // port   : number.required(),
    // secure : boolean.required(),
    auth   : Joi.object({
        user: string
            // .alphanum()
            .min(3)
            .max(30)
            .required(),
        pass: string.required()
    })
})

const EmailSchema = Joi.object({
    from   : string.email().required(),
    to     : string.email().required(),
    subject: string.required(),
    text   : string,
    html   : string
})

module.exports = {
    name: 'b1nodemailer',
    async register(server, options) {
        // server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1nodemailer:options]') // HACK: [10/07/2024] Se quito validación opciones momentaneamente

        const transporter = nodemailer.createTransport(options);
        transporter.OK = true
        transporter.verify(error => {
            if (error) {
                console.log('SMTP: ' + ` ECONNREFUSED ${error.code} \n`.BgYellow.FgBlack);
                transporter.OK = false
            } else {
                console.log('SMTP: ' + options.service.Margin.BgGreen.FgWhite + '\n')
            }
        });

        server.method({
            name: 'sendEmail',
            method: async function(emailOptions) {
                if (transporter.OK) {
                    const {error, value} = EmailSchema.validate(emailOptions)
                    if (!error) {
                        const info = await transporter.sendMail(emailOptions)
                        if (info.accepted.length > 0) {
                            return 'ok'
                        } else {
                            const error = new Error('Not sent')
                            return server.errManager({error, from: '[plugin:b1nodemailer:sendMail]'})
                        }
                    } else {
                        return server.errManager({error, from: '[plugin:b1nodemailer:validation]'})
                    }
                } else {
                    const error = new Error('Unavailable')
                    return server.errManager({error, from: '[plugin:b1nodemailer:unavailable]'})
                }
            }
        });
    }
}
