// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

const Joi = require('joi');
const { string, boolean, array, number, date, any } = Joi.types();

module.exports = [
    {
        name      : 'lugar',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    {
        name      : 'activo_lineal',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
        ]
    },
    {
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
    {
        name      : 'material_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
        ]
    },
    {
        name      : 'tramitesae_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
        ]
    },
    {
        name      : 'tramitesae',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['*'] },
            { name: 'findID', permissions: ['USER'] },
            { name: 'updateID', permissions: ['USER'] },
            { name: 'create', permissions: ['USER'] },
        ]
    },
    {
        name      : 'resultado_ensayo',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'Activos',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
            { name: 'create', permissions: [] },
        ]
    },
    {
        name      : 'Activos_view',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'Activos_count',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'trafosP',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'trabajos_TP',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'licenciasMTO',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'EstructuraClases',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'relaciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name      : 'Ubicaciones',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
        ]
    },
    {
        name      : 'planesTrabajo',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
        ]
    },
    {
        name      : 'OTs',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
            { name: 'create', permissions: [] },
            { name: 'updateID', permissions: [] },
        ]
    },
    {
        name: 'repo-horas',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
            { name: 'create', permissions: [] },
            { name: 'updateID', permissions: [] },
        ],
        schema: Joi.object({
            _id           : string.required(),
            ot            : string.required(),
            fecha         : date.required(),
            dia           : number.min(1).max(31).required(),
            mes           : number.min(1).max(12).required(),
            anio          : number.integer().required(),
            tipoOt        : string.uppercase().valid(...['MP', 'MONTAJE', 'NO_PROGRAMADO', 'NOVEDAD', 'EMERGENCIA', 'CAPACITACION', 'EXTERNO']).required(),
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
    {
        name: 'Persona',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
            { name: 'create', permissions: [] },
            { name: 'updateID', permissions: [] },
        ]
    },
    {
        name      : 'Reglas',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: [] },
            { name: 'upsert', permissions: [] },
            { name: 'create', permissions: [] },
        ]
    },
]
