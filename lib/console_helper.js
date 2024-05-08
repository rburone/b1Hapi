require('./b1-colorString')

let print = true

const format = {
    info     : ['%s ', '%s '.Bright.FgGreen],
    error    : [' %s '.BgRed.FgWhite, ' %s', ' at '+'%s'.FgCyan],
    warning  : [' %s '.BgYellow.FgBlack, '%s', ' at ' + '%s'.FgCyan],
    highlight: ['%s ', ' %s '.Bright.BgGreen],
    tell     : [' %s '.Bright.BgGreen, ' %s'.FgGreen]
}

function say() {
    const template = format[arguments[0]]
    const args = []
    let out = ''
    for (let i = 0; i < template.length; i++) {
        out += template[i]
        if (arguments[i+1]) args.push(arguments[i+1])
    }
    console.log(out, ...args)
}

module.exports = say
