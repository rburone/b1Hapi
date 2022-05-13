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

const {string, number} = Joi.types();
const OptionsSchema = Joi.object({
    host: string.required(),
    port: number.required(),
    auth: Joi.object({
        user: string
            .alphanum()
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
        server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1nodemailer:options]')
        
        const transporter = nodemailer.createTransport(options);
        transporter.OK = true
        transporter.verify(error => {
            if (error) {
                console.log('SMTP: \x1b[43m\x1b[31m ECONNREFUSED \x1b[0m\n');
            }
            transporter.OK = false
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
                            return server.errManager({error: 'Not sent', from: '[plugin:b1nodemailer:sendMail]'})
                        }
                    } else {
                        return server.errManager({error, from: '[plugin:b1nodemailer:validation]'})
                    }
                } else {
                    return server.errManager({error: 'Unavailable', from: '[plugin:b1nodemailer:unavailable]'})
                }
            }
        });
    }
}