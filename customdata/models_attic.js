// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

const DEFAULT_ROLES = ['*']

module.exports = [
    { // cliente
        name      : 'cliente',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            // { name: 'create', permissions: ['BLOQUED'] } ⚠ Esta accion se maneja en la creacion de usuarios
        ],
        // schema: Joi.object({
        //     email        : string.email({ tlds: { allow: false } }).required(),
        //     Nombre       : string.required(),
        //     Direccion    : string.required(),
        //     Telefono1    : string.required(),
        //     Telefono2    : string,
        //     web          : string,
        //     observaciones: string,
        //     localidad    : string,
        //     provincia    : string,
        //     cuit         : string.required(),
        //     razon        : string.required(),
        //     Activo       : boolean
        // }),
        schema: import('./schemas/schema-cliente.mjs').then(r => r.default)
    },
    { // responsable
        name      : 'Responsable',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            // { name: 'create', permissions: ['BLOQUED'] } ⚠ Esta accion se maneja en la creacion de usuarios
        ],
        schema: import('./schemas/schema-responsable.mjs').then(r => r.default)
    },
]

