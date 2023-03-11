'use strict'
/******************************************************
* b1ErrMng.js
* Decorate server with two functions for error managment, pretty print en response return
* Autor: Ricardo D. Burone <rdburone@gmail.com>
*
* server.errManager: Pretty print of error on console and response return
* server.assert: Pretty print of Joi assertion
*/
const Boom = require('@hapi/boom')
const CODE = require('../lib/color_codes')

function template() {
    let out = ''
    Array.from(arguments).forEach(code => {
        out += code
    })
    return out + ' %s ' + CODE.Reset
}

const format = {
    info   : template(CODE.BgWhite, CODE.FgBlue),
    error  : template(CODE.BgRed, CODE.FgWhite),
    warning: template(CODE.BgYellow, CODE.FgBlack),
}

function say(type, title, msg, from) {
    if (print) {
        from = `at ${CODE.FgCyan}${from}${CODE.Reset}`
        console.log(format[type], title, msg, from)
    }
}

function genericError(code, message, from) {
    const search = code || message
    console.log(code, message)
    switch (search + '') {
        case 'Schema':
            say('error', 'Schema', 'Invalid', from)
            return Boom.internal()
        case 'Not sent':
            say('warning', 'Email', 'Not sent', from)
            return 'Not sent'
        case 'Unavailable':
            say('error', 'Service', 'Unavailable', from)
            return Boom.serverUnavailable()
        case 'ESOCKET':
            say('error', 'Connection', message, from)
            return Boom.internal()
        case 'NOCRITICAL':
            say('warning', 'Atetion', message, from)
        case 'Not sent':
            say('warning', 'Email', 'Not sent', from)
            return 'Not sent'
        case 'ENOENT':
            say('error', 'Internal', 'File not found', from)
            return Boom.internal()
        case '400':
            say('error', 'Response', 'Bad Request', from)
            return Boom.badRequest()
        case '401':
            return Boom.unauthorized()
        case '404':
            return Boom.notFound()
        case '500':
            say('error', 'Internal', message, from)
            return Boom.internal()
        default:
            return Boom.internal()
    }
}

function manager({error, from}) {
    const name = error?.constructor.name || 'Undefined'
    switch (name) {
        case 'Number':
            return genericError(error)
        case 'String':
            say('warning', 'DECPRECATED', 'Change STRING for ERROR', from)
            return genericError(null, error, from)
        case 'Error':
                return genericError(error.code, error.message, from)
        case 'MongoServerError':
            say('warning', `MongoServer: ${error.code}`, error.keyValue, from)
            return 'unchange'
        case 'MongoInvalidArgumentError':
            say('error', 'MongoServer:', error.message, from)
            return Boom.internal()
        case 'TypeError':
            say('error', 'Internal TypeError', error.message, from)
            return Boom.internal()
        case 'ValidationError':
            say('error', 'Validation', error.message, from)
            console.table(error._original)
            return Boom.internal()
        default:
            say('error', name, error?.message, from)
            return Boom.internal()
    }
}

function assert(assert, toAssert = {}, schema = {}, from = '') {
    try {
        assert(toAssert, schema)
    } catch (error) {
        say('error', 'Assertion', error.message, from)
        throw(`\n${CODE.BgYellow}${CODE.FgRed} --- ASSERTION ERROR: SERVER STOPED ---${CODE.Reset}\n`)
    }
}

let print

module.exports = {
    name: 'b1ErrMng',
    register(server, options) {
        print = options.doLog || false
        server.decorate('server', 'errManager', manager)
        server.decorate('server', 'assert', assert)
    }
}
