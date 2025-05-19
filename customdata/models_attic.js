// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

const DEFAULT_ROLES = ['*']

async function load(file) {
    return new Promise(resolve => {
        import(`./schemas/${file}`).then(schema => resolve(schema.default))
    })
}

const definition = [
    { // cliente
        name      : 'cliente',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            // { name: 'create', permissions: ['BLOQUED'] } ⚠ Esta accion se maneja en la creacion de usuarios
        ],
        // schema: import('./schemas/schema-cliente.mjs').then(r => r.default)
        schema: 'schema-cliente.mjs'
    },
    { // responsable
        name      : 'Responsable',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            // { name: 'create', permissions: ['BLOQUED'] } ⚠ Esta accion se maneja en la creacion de usuarios
        ],
        // schema: import('./schemas/schema-responsable.mjs').then(r => r.default)
        schema: 'schema-responsable.mjs'
    },
    { // trabajo
        name      : 'Trabajo',
        dataSource: 'mongodb8',
        actions   : [
            { name: 'search', permissions: DEFAULT_ROLES },
            { name: 'upsert', permissions: DEFAULT_ROLES },
            { name: 'create', permissions: DEFAULT_ROLES },
            { name: 'delete', permissions: DEFAULT_ROLES },
        ],
        // schema: await import('./schemas/schema-trabajo.mjs').then(r => r.default)
        schema: 'schema-trabajo.mjs'
    },
]

function loadSchemas() {
    definition.forEach(async defObj => {
        if (defObj.schema) {
            defObj.schema = await load(defObj.schema)
        }
    })
    module.exports = definition
}

loadSchemas()
