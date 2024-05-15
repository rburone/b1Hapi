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

function tryAttemp(definition, schema) {
    try {
        const out = Joi.attempt(definition, schema)

        return { value: out, error: false }
    } catch (errors) {
        console.log(errors)
        const listError = []
        errors.details.forEach(error => {
            // console.log(error.context);
            let auxDesc = ''
            if (error.context.regex) {
                auxDesc = ': ' + error.context.regex.toString()
            } else if (error.context.valids) { auxDesc = ': (' + error.context.valids.join(',') + ')' }
            listError.push(`${error.context.label} ${error.type}${auxDesc} => [${error.context.value}]`)
        })
        return { value: listError, error: true }
    }
}

const b1Lib = {
    /**
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
    objSize  : obj => Object.keys(obj).length,
    validate : (definition, schema) => validate(definition, schema),
    tryAttemp: (definition, schema) => tryAttemp(definition, schema)
}

module.exports = {b1Lib}
