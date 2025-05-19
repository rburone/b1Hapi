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

const errorMap = {
    'ESOCKET'  : ['No se pudo conectar al mail server.','unavailable'],
    Unavailable: ['No se pudo conectar al mail server.','unavailable'],
}

module.exports = {
    name: 'b1nodemailer',
    async register(server, options) {
        const resolver = new server.errorParser(errorMap)
        // server.assert(Joi.assert, options, OptionsSchema, '[plugin:b1nodemailer:options]') // HACK: [10/07/2024] Se quito validación opciones momentaneamente

        const transporter = nodemailer.createTransport(options);
        transporter.OK = true
        transporter.verify(error => {
            if (error) {
                console.log('SMTP: ' + options.service.Margin.Bright.BgGreen + ` ECONNREFUSED ${error.code} \n`.BgYellow.FgBlack);
                transporter.OK = false
            } else {
                console.log('SMTP: ' + options.service.Margin.BgGreen.FgWhite + ' OK\n'.Bright.FgGreen)
            }
        });

        server.method({
            name: 'sendEmail',
            method: async function(emailOptions) {
                // transporter.OK = true
                if (transporter.OK) {
                    const {error, value} = EmailSchema.validate(emailOptions)
                    if (!error) {
                        try {
                            const info = await transporter.sendMail(emailOptions)
                            if (info.accepted.length > 0) {
                                return 'ok'
                            } else {
                                return resolver.parse(Error('Notsent'), `[plugin:b1nodemailer:sendMail]`)
                            }
                        } catch (error) {
                            return resolver.parse(error, '[plugin:b1nodemailer:sendMail:connection]')
                        }


                    } else {
                        return resolver.joi(error, `[plugin:b1nodemailer:sendMail:validation]`)
                    }
                } else {
                    resolver.parse(Error('Unavailable'), '[plugin:b1nodemailer:sendMail:unavailable]' )
                }
            }
        });
    }
}
