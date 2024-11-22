// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

const Joi = require('joi');
const { string, boolean, array, number, date, any } = Joi.types();

// const TIPO_OT     = ['MP', 'MONTAJE', 'NO_PROGRAMADO', 'NOVEDAD', 'EMERGENCIA', 'CAPACITACION', 'EXTERNO']
const TIPO_OT     = ['MP', 'MONTAJE', 'ANALISIS', 'NO_PROGRAMADO', 'NOVEDAD']
const STATUS      = ['EAPROB', 'ASIGN', 'APROB', 'ING_MTO', 'EMTRL', 'EPROG', 'PROG_MTO', 'PROG_OP', 'ENPRG', 'RECHAZADA', 'COMP', 'CAN', 'CERR', 'ENVIADA']
const VAL_MEDIDAS = ['NO DETECTADO', 'PRESENCIA', 'LEVE PRESENCIA']
const STATUSPLAN  = ['ACTIVO', 'INACTIVO', 'REVISADO']

const dateSchema = Joi.object({
    dia: number.integer().max(31).min(1),
    mes: number.integer().max(12).min(1),
    año: number.integer()
})

module.exports = [
    { // name
        name      : 'lugar',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    { // activo_lineal
        name      : 'activo_lineal',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    { // material
        name      : 'material',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['*'] },
            { name: 'updateID', permissions: ['*'] },
            { name: 'replaceID', permissions: ['*'] },
            { name: 'create', permissions: ['USER'] },
        ]
    },
    { // material_view
        name      : 'material_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
        ]
    },
    { // tramitesae_view
        name      : 'tramitesae_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
        ]
    },
    { // tramitesae
        name      : 'tramitesae',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
        ]
    },
    { // resultado_ensayo
        name      : 'resultado_ensayo',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // Activos
        name      : 'Activos',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['USER'] },
            { name: 'findID', permissions: [] },
            { name: 'upsert', permissions: ['ADMIN'] },
            { name: 'create', permissions: ['ADMIN'] },
        ]
    },
    { // usoHorasAct
        name: 'usoHorasAct',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: ['USER'] },
            { name: 'findID', permissions: [] },
            { name: 'upsert', permissions: ['ADMIN'] },
            { name: 'create', permissions: ['ADMIN'] },
        ]
    },
    { // Activos_view
        name      : 'Activos_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'findID', permissions: [] },
        ]
    },
    { // Activos_count
        name      : 'Activos_count',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // ensayo
        name      : 'ensayo',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['*'] },
            { name: 'create', permissions: ['*'] },
        ],
        schema: Joi.object({
            _id                     : string.required(),
            description             : string.required(),
            location                : string.required(),
            assetnum                : string.uppercase().pattern(/\w{2}\d{6}/).required(),   // llnnnnnn
            desc_asset              : string.required(),
            jpnum                   : string.required(),
            e_fecha_ensayo          : date.allow(''),
            e_diagnostico_ensayo    : string.allow(''),
            e_diagnostico_ensayo_lab: string.allow(''),
            e_informe_ensayo        : string.allow(''),
            e_inspector             : string.allow(''),
            vendor                  : string.allow(''),
            status                  : string.valid(...STATUS),
            statusdate              : string.required()
        })
    },
    { // mediciones
        name      : 'mediciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['ADMIN'] },
            { name: 'create', permissions: ['ADMIN'] },
            { name: 'delete', permissions: ['ADMIN'] },
        ],
        schema: Joi.object({
            // _id             : string.required(),
            wonum           : string.required(),
            assetnum        : string.uppercase().pattern(/\w{2}\d{6}/).required(),                    // llnnnnnn
            metername       : string.required(),
            measurementvalue: Joi.alternatives().try(number, Joi.valid(...VAL_MEDIDAS)).required(),
            measurementdate : date.required()
        })
    },
    { // Protecciones
        name: 'Protecciones',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
        ]
    },
    { // Protecciones_view
        name: 'Protecciones_view',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
        ]
    },
    { // trafosP
        name      : 'trafosP',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // trabajos_TP
        name      : 'trabajos_TP',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // licenciasMTO
        name      : 'licenciasMTO',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // EstrucutraClases
        name      : 'EstructuraClases',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // relaciones
        name      : 'relaciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    { // Ubicaciones
        name      : 'Ubicaciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
        ]
    },
    { // planesTrabajo
        name      : 'planesTrabajo',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
        ]
    },
    { // planesMtto
        name      : 'planesMtto',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['USER'] },
            { name: 'upsert', permissions: ['USER'] },
        ],
        schema: Joi.object({
            _id        : string.required(),
            descripcion: string.required(),
            location   : string.allow(''),
            PT         : string.required(),
            assetnum   : string.required(),
            ownergroup : string.required(),
            fechaIni   : date.allow(''),
            fechaFin   : date.allow(''),
            fechaNxt   : date.allow(''),
            usarOT     : string.required(),
            status     : string.valid(...STATUSPLAN).required(),
            fechaFirst : date.allow('').required(),
            frequencia : number.required(),
            unidad     : string.required(),
            user       : string,
            fechaModif : date.required(),
        })
    },
    { // OTs
        name      : 'OTs',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    { // consumoHoras
        name: 'consumoHoras',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ],
        schema: Joi.object({
            _id           : string.required(),
            ot            : string.required(),
            fecha         : date.required(),
            dia           : number.min(1).max(31).required(),
            mes           : number.min(1).max(12).required(),
            anio          : number.integer().required(),
            tipoOt        : string.uppercase().valid(...TIPO_OT).required(),
            idrh          : string.required(),
            apellidoNombre: string.required(),
            minIni        : number.required(),
            minFin        : number.required(),
            jornada       : number.required(),
            tarea         : string,
            localizacion  : string.required(),
            zona          : string.required(),
            NH            : boolean.required(),
            min50         : number.integer().required(),
            min100        : number.integer().required(),
            min100n       : number.integer().required(),
            minC          : number.integer().required(),
            minT          : number.integer().required(),
            franco        : any.allow(1, false),
            sectorId      : string.required(),
            maxIni        : number.integer().required(),
            maxFin        : number.integer().required(),
            idx           : string.required(),
            tieneExtra    : boolean.required(),
            // sector        : string.required(),
            // gerencia      : string.required(),
        })
    },
    { // repo-horas
        name: 'repo-horas',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ],
        schema: Joi.object({
            _id         : number.integer(),
            num_ot      : number.integer().required(),                        // eslint-disable-line camelcase
            fecha       : string.pattern(/\d{2}\/\d{2}\/\d{4}/).required(),
            fechaObj: Joi.object({
                dia: number.integer().max(31).min(1),
                mes: number.integer().max(12).min(1),
                año: number.integer()
            }),
            idrh        : number.integer().required(),
            hora_inicio : string.pattern(/\d{2}:\d{2}:\d{2}/).required(),     // eslint-disable-line camelcase
            hora_fin    : string.pattern(/\d{2}:\d{2}:\d{2}/).required(),     // eslint-disable-line camelcase
            jornada     : number.required(),
            zona        : string.required(),
            sector      : string.required(),
            tipo_ot     : string.valid(...TIPO_OT).required(),                // eslint-disable-line camelcase
            habil       : string.valid('SI', 'NO').required(),
            capacitacion: string.allow(''),
            tipo_cap    : string.allow(''),                                   // eslint-disable-line camelcase
            ubicacion   : string.pattern(/\w.{4}(\.)?.*/).required(),
            ubiDesc     : string.required()
        })

    },
    { // Persona
        name: 'Persona',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    { // CapHumano
        name: 'CapHumano',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    { // Reglas
        name      : 'Reglas',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search',   permissions: ['USER'] },
            { name: 'deleteID', permissions: ['USER'] },
            { name: 'upsert',   permissions: ['USER'] },
            { name: 'create',   permissions: ['USER'] },
        ]
    },
    { // Importaciones
        name      : 'importaciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['USER'] },
            { name: 'upsert', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
        ],
        schema: Joi.object({
            dateFile : string.required(),
            user     : string.required(),
            type     : string.required(),
            updates  : number.integer(),
            news     : number.integer(),
            timeStamp: date.timestamp()
        })
    },
    { // Importaciones_view
        name      : 'importaciones_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
]
