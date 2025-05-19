const crypto = require('crypto');

/**
 * Check if a object has valid definition
 * @param {object} definition Object
 * @param {object:schema} schema Joi Object
 * @returns boolean
 */
function validate(definition, schema) {
    console.log(Object.getPrototypeOf(schema).constructor.name)
    let out = false
    try {
        const { value, error } = schema.validate(definition)
        if (error) {
            error.details.forEach(error => {
                console.error('Schema error: %s \n', error.message)
            })
        } else out = value
    } catch (error) {
        console.error('[b1Lib:validate] Schema is not a JOI Object!')
    }
    return out
}
const whiteRegex = new RegExp(/^[\s\f\n\r\t\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+$/);

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
    objSize         : obj => Object.keys(obj).length,
    validate        : (definition, schema) => validate(definition, schema),
    tryAttemp       : (definition, schema) => tryAttemp(definition, schema),
    deleteWhitespace: obj => {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; ++i) {
            if (whiteRegex.test(obj[keys[i]])) {
                delete obj[keys[i]];
            }
        }
        return obj;
    }
}

module.exports = {b1Lib}
