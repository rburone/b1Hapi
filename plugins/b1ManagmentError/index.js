const Boom = require('@hapi/boom')
const say = require('../../lib/console_helper')

const getClass = val => val ? Object.getPrototypeOf(val).constructor.name : false
const timeStamp = () => (new Date()).toTimeString().split(' ')[0]

const sayError = (errorType = '', message = '', reference = '') => say('error', timeStamp(), errorType, message, reference)

class b1ManagmentError extends Error {
    constructor(codeMessageMap = {}) {
        super()
        // this.name = 'b1ManagmentError'
        // this.code = code
        this.codeMessageMap = codeMessageMap
        // this.userMessage = codeMessageMap[code] || 'Server error'
    }

    parse(error, reference) {
        const errorType = getClass(error)

        switch (errorType) {
            case 'MongoServerError':
                const {index, code, keyPattern, keyValye} = error.errorResponse
                const [message, funcType] = this.codeMessageMap[code] || ''
                if (doLog) say('error', timeStamp(), errorType, message, reference)
                return Boom[funcType](message)
                break;
            case 'Error':
                if ('code' in error) {
                    switch (error.code) {
                        case 'ESOCKET':
                            if (doLog) sayError(errorType, message, reference)
                            return Boom[funcType](message)
                    }
                } else if ('message' in error) {
                    switch (error.message) {
                        case 'Unavailable':
                            if (doLog) sayError(errorType, error.message, reference)
                            return Boom.serverUnavailable('Mailserver no responde.')
                            break;
                        default:
                            if (doLog) sayError(errorType, error.message, reference)
                            return Boom.notImplemented('Error no procesable.')
                    }
                }
                break;
            default:
                if (doLog) say('error', timeStamp(), errorType, 'No implementado', reference)
                return Boom.notImplemented('Error no procesable.')
                break;
        }
    }

    joi(error, reference) {
        if (error.isJoi) {
            say('error', timeStamp(), 'ValidationError', `FOUND: ${error.details.length}`, reference)
            error.details.forEach((element, idx) => {
                say('item', idx + 1 , element.message)
            });

            return Boom.internal(error.details.message)
        }
    }
}
let doLog
module.exports = {
    name: 'b1ManagmentError',
    register(server, options) {
        doLog = options.doLog || false
        server.decorate('server', 'errorParser', b1ManagmentError)
        // server.decorate('server', 'assert', assert)
    }
}
