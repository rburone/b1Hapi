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

function codeManager (error) {
    switch (error) {
        case 401:
            return Boom.unauthorized()
        case 404:
            return Boom.notFound()
        case 500:
            return Boom.internal()
        default:
            return Boom.internal()
    }
}

function strCodeManager(errorObj) {
    switch (errorObj.error) {
        case 'Schema':
            say('error', 'Schema', 'Invalid', errorObj.from)
            return Boom.internal()
        case 'Not sent':
            say('warning', 'Email', 'Not sent', errorObj.from)
            return 'Not sent'
        case 'Unavailable':
            say('error', 'Service', 'Unavailable', errorObj.from)
            return Boom.serverUnavailable()
        default:
            break;
    }
}

function stdManager(errorObj) {
    switch (errorObj.error.code) {
        case 'ESOCKET':
            say('error', 'Connection', errorObj.error.message, errorObj.from)
            return Boom.internal()
        case 'Not sent':
            say('warning', 'Email', 'Not sent', errorObj.from)
            return 'Not sent'
        case 'ENOENT':
            say('error', 'Internal', 'File not found', errorObj.from)
            return Boom.internal()
        default:
            break;
    }
}

function manager(errorObj) {
    const name = errorObj.error.name || errorObj.error.constructor.name
    // console.log('ERROR RAW: ', `name: "${name}"`, errorObj)

    switch (name) {
        case 'Number':
            return codeManager(errorObj.error)
        case 'String':
            return strCodeManager(errorObj)
        case 'Error':
            return stdManager(errorObj)
        case 'MongoServerError':
            say('warning', `MongoServer: ${errorObj.error.code}`, errorObj.error.keyValue, errorObj.from)
            return 'unchange'
        case 'MongoInvalidArgumentError':
            say('error', 'MongoServer:', errorObj.error.message, errorObj.from)
            return Boom.internal()
        case 'TypeError':
            say('error', 'Internal TypeError', errorObj.error.message, errorObj.from)
            return Boom.internal()
        case 'ValidationError':
            say('error', 'Validation', errorObj.error.message, errorObj.from)
            console.table(errorObj.error._original)
            return Boom.internal()
        default:
            say('error', name, errorObj.error.message, errorObj.from)
            return Boom.internal()
    }
}

function assert(assert, toAssert = {}, schema = {}, from = '') {
    try {
        assert(toAssert, schema)
    } catch (error) {
        say('error', 'Assertion', error.message, from)
        throw(`\n${CODE.BgYellow}${CODE.FgRed} --- ASSERTION ERROR SERVER STOP ---${CODE.Reset}\n`)
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