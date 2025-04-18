// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

const Joi = require('joi');
const { string, boolean, _array, number, date, _any } = Joi.types();

// const TIPO_OT     = ['MP', 'MONTAJE', 'NO_PROGRAMADO', 'NOVEDAD', 'EMERGENCIA', 'CAPACITACION', 'EXTERNO']
// const TIPO_OT     = ['MP', 'MONTAJE', 'ANALISIS', 'NO_PROGRAMADO', 'NOVEDAD']
// const STATUS      = ['EAPROB', 'ASIGN', 'APROB', 'ING_MTO', 'EMTRL', 'EPROG', 'PROG_MTO', 'PROG_OP', 'ENPRG', 'RECHAZADA', 'COMP', 'CAN', 'CERR', 'ENVIADA']
// const VAL_MEDIDAS = ['NO DETECTADO', 'PRESENCIA', 'LEVE PRESENCIA']
// const STATUSPLAN  = ['ACTIVO', 'INACTIVO', 'REVISADO']

// const dateSchema = Joi.object({
//     dia: number.integer().max(31).min(1),
//     mes: number.integer().max(12).min(1),
//     año: number.integer()
// })

const DEFAULT_ROLES = ['*']
module.exports = [
    { // cliente
        name      : 'cliente',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            { name: 'create', permissions: DEFAULT_ROLES },
        ],
        schema: Joi.object({
            email        : string.email({ tlds: { allow: false } }).required(),
            Nombre       : string.required(),
            Direccion    : string.required(),
            Telefono1    : string.required(),
            Telefono2    : string,
            web          : string,
            observaciones: string,
            localidad    : string,
            provincia    : string,
            cuit         : string.required(),
            razon        : string.required(),
            Activo       : boolean
        })
    },
    { // responsable
        name      : 'Responsable',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            { name: 'create', permissions: ['Sysadmin'] },
        ],
        schema: Joi.object({
            email        : string.email({ tlds: { allow: false } }).required(),
            nombre       : string.required(),
            idArea       : string.required(),
            direccion    : string.required(),
            telefono1    : string.required(),
            comision     : string,
            observaciones: string,
            isActivo     : boolean
        })
    },
    // { // mediciones
    //     name      : 'mediciones',
    //     dataSource: 'mongodb4',
    //     actions   : [
    //         { name: 'search', permissions: [] },
    //         { name: 'upsert', permissions: ['ADMIN'] },
    //         { name: 'create', permissions: ['ADMIN'] },
    //         { name: 'delete', permissions: ['ADMIN'] },
    //     ],
    //     schema: Joi.object({
    //         // _id             : string.required(),
    //         wonum           : string.required(),
    //         assetnum        : string.uppercase().pattern(/\w{2}\d{6}/).required(),                    // llnnnnnn
    //         metername       : string.required(),
    //         measurementvalue: Joi.alternatives().try(number, Joi.valid(...VAL_MEDIDAS)).required(),
    //         measurementdate : date.required()
    //     })
    // }
]
