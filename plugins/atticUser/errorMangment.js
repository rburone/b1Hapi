class b1ManagmentError extends Error {
    constructor(code, message, error, codeMessageMap) {
        super(message)
        this.name = 'b1ManagmentError'
        this.code = code
        this.error = error
        this.codeMessageMap = {
            'insert_token': 'Error grave. No se pudo registrar la clave token.',
            11000         : 'Registro duplicado.'
        }
        this.userMessage = codeMessageMap[code] || 'Server error'
    }
}

module.exports = {
    name: 'b1ManagmentError',
    register(server, options) {
        print = options.doLog || false
        server.decorate('server', 'errorResolve', b1ManagmentError)
        // server.decorate('server', 'assert', assert)
    }
}
