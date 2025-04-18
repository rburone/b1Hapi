const Joi = require ('joi');

const ROLS = ['SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST'] // TODO: [12/07/2024] Ver si se puede usar una lista cargada del server

const {string, array } = Joi.types();

const schema = {
    email   : 'string.email({ tlds: { allow: false } }).required()',
    roles   : 'array.items(string.uppercase().valid(...ROLS)).required',
    password: "string.default('*')"
}

const jschema = Joi.object({
    email   : string.email({ tlds: { allow: false } }).required(),
    roles   : array.items(string.uppercase().valid(...ROLS)).required(),
    password: string.default('*')
})

function execJoi(obj) {
    const {string, array } = Joi.types();
    const joiObj = {}
    for (const key in obj) {
        const joiStr = obj[key];
        joiObj[key] = Function('string','array','ROLS', joiStr)(string, array, ROLS)
    }
    return Joi.object(joiObj)
}

const a = execJoi(schema)
console.log(a.validate({}))
// console.log(jschema.validate({}))

// const t = 'string,emai,required'
