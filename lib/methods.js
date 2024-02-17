const crypto = require('crypto');

/**
 * Check if a object has valid definition
 * @param {object} definition Object
 * @param {object:schema} schema Joi Object
 * @returns boolean
 */
function validate(definition, schema) {
    let out = false
    try {
        const { value, error } = schema.validate(definition)
        if (error) {
            error.details.forEach(error => {
                console.error('Schema error: %s \n', error.message)
            })
        } else out = value
    } catch (error) {
        console.error('Schema is not a JOI Object!')
    }
    return out
}

const b1Lib = {
    /**
     *
     * @param {number} n Number of digits length of code
     * @returns Strting with the code generated
     */
    generate(n) {
        let num = ''
        for (let x = 1; x <= n; x++) {
            num += crypto.randomInt(10).toString()
        }
        return num
    },
    objSize(obj) {
        return Object.keys(obj).length
    },
    validate: (definition, schema) => validate(definition, schema)
}

module.exports = {b1Lib}
