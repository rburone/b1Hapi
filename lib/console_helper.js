const CODE = require('.//color_codes')

let print = true

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

module.exports = say
