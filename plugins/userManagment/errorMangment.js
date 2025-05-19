class UserManagmentError extends Error {
    constructor(code, message, error) {
        super(message)
        this.name = 'UserManagmentError'
        this.code = code
        this.error = error
        const codeMessageMap = {
            'insert_token': 'Error grave. No se pudo registrar la clave token.'
        }
        this.userMessage = codeMessageMap[code] || 'Server error'
    }
}

module.exports = UserManagmentError
