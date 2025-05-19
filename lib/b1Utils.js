// [05/09/2024] v.1.1
// [07/09/2024] v.1.2
// [01/03/2025] v.1.3 FIXED 🐞: error in isInstanceOf
const noValidValue = null
const typesList   = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array', 'Null', 'Boolean', 'Object', 'Undefined']

const it = {
    isEmpty         : val => val ? (val + '').trim().length == 0                                                : true,
    isNotEmpty      : val => val ? (val + '').trim().length != 0                                                : false,
    isNumeric       : val => val === 0 || (val && !isNaN(val * 1) && !(val instanceof Date) && !it.isArray(val)),
    isDefined       : val => !it.isUndefined(val),
    isNotNullDefined: val => !it.isUndefined(val) && !it.isNull(val),
    isGhostChar     : val => {
        const ghostRegex = /[\f\n\r\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff\x09\x0a\x0b\x0c\x0d\x20\xa0]+/g  // eslint-disable-line
        return ghostRegex.test(val)
    },
    isInstanceOf: (val, instanceName) => it.isNotNullDefined(val) ? Object.getPrototypeOf(val).constructor.name == instanceName : false
}

const get = {
    ifNotEmpty: val => (!it.isEmpty(val)) ? val : noValidValue,
    ifInArray : (array, val) => (it.isArray(array) && array.some(item => item == val)) ? val : noValidValue,
    ifIsKey   : (object, key) => (it.isObject(object) && Object.keys(object).some(item => item == key)) ? key : noValidValue,
    ifNotNaN  : val => (val && !isNaN(val)) ? val : noValidValue,
    type      : val => / (.+)]$/.exec(toString.call(val))[1],
    class     : val => !it.isNull(val) ? Object.getPrototypeOf(val).constructor.name : false
}

typesList.forEach(
    function (name) {
        it['is' + name] = obj => {
            return toString.call(obj) == '[object ' + name + ']';
        };
        get['if' + name] = obj => {
            return (toString.call(obj) == '[object ' + name + ']') ? obj : noValidValue
        }
    }
);

Object.defineProperty(Object.prototype, 'isInstanceOf', {
    enumerable  : false,
    configurable: true,
    writable    : false,
    value       : function (instanceName) {
        return this.constructor.name == instanceName
    }
})

module.exports = { it, get }

