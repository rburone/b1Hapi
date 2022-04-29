'use strict'

function CSVfy(dataObj, fields = [], delimiter = ';') {
    const newLine = '\n'

    const headCSV = function(object) {
        function subHead(subObject, key) {
            let header = ''
            let sep = ''
            Object.keys(subObject).forEach((sk) => {
                const head = key + '.' + sk
                if (typeof subObject[sk] == 'object') {
                    header += sep + subHead(subObject[sk], head)
                } else header += sep + head
                sep = delimiter
            })
            return header
        }

        let headStr = ''
        let sep = ''

        fields.forEach((key) => {
            if (object) {
                if (
                    !Array.isArray(object[key]) &&
                    typeof object[key] == 'object'
                ) {
                    if (Object.keys(object[key]).length !== 0) {
                        Object.keys(object[key]).forEach((sk) => {
                            const head = key + '.' + sk
                            if (
                                !Array.isArray(object[key][sk]) &&
                                typeof object[key][sk] == 'object'
                            ) {
                                headStr += sep + subHead(object[key][sk], head)
                            } else headStr += sep + head
                            sep = delimiter
                        })
                    } else headStr += sep + key
                } else {
                    if (Array.isArray(object[key])) {
                        headStr += sep + subHead(object[key][0], key)
                    } else headStr += sep + key
                }
                sep = delimiter
            }
        })
        return headStr
    }

    const toCSV = function(object) {
        function subCSV(subObj) {
            let salida = ''
            let sep = ''
            let value = ''
            if (subObj) {
                Object.keys(subObj).forEach((sk) => {
                    value = subObj[sk] != '' ? subObj[sk] : '-'
                    if (typeof subObj[sk] == 'object') {
                        salida += sep + subCSV(subObj[sk])
                    } else {
                        salida += sep + subObj[sk]
                    }
                    sep = delimiter
                })
            }
            return salida
        }

        function marker(objectWM) {
            let salidaStr = ''
            let sep = ''
            let marcas = []
            for (let k in objectWM) {
                if (fields.find((fk) => fk == k)) {
                    if (Array.isArray(objectWM[k])) {
                        salidaStr += sep + '@' + k
                        marcas.push(k)
                    } else if (typeof objectWM[k] == 'object') {
                        salidaStr += sep + subCSV(objectWM[k])
                    } else {
                        salidaStr += sep + objectWM[k]
                    }
                    sep = delimiter
                }
            }
            return [salidaStr.replace(/\n/g, ''), marcas]
        }

        let [salidaMK, marcas] = marker(object)
        let csv = ''

        if (marcas.length > 0) {
            let template = [salidaMK]
            marcas.some((mc) => {
                let cTemplate = template
                template = []
                cTemplate.forEach((te) => {
                    object[mc].forEach((campo) => {
                        if (!Array.isArray(campo) && typeof campo == 'object') {
                            template.push(te.replace('@' + mc, subCSV(campo)))
                        } else template.push(te.replace('@' + mc, campo))
                    })
                })
            })
            csv += template.join(newLine) + newLine
        } else csv = salidaMK + newLine

        return csv
    }

    /*const data = dataObj.map((reg) => {
        delete reg.__data.id
        return reg.__data
    })*/

    const data = dataObj

    fields = fields.length > 0 ? fields : Object.keys(data[0])
    const theHeader = headCSV(data[0], fields)
    let theData = ''

    data.forEach((row) => {
        theData += toCSV(row)
    })

    return theHeader + newLine + theData
}

module.exports = {
    name: 'b1CSVfy',
    register(server) {
        server.decorate('toolkit', 'b1CSVfy', CSVfy)
    }
}