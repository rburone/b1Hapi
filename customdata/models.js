// Permissions with ['*'] any rol but needs authentication
// Permissions with [] not need authentication

module.exports = [
    {
        name      : 'User',
        dataSource: 'mongodb4',
        actions   : [
            { name: 'search', permissions: ['ADMIN'] },
            { name: 'findID', permissions: ['ADMIN'] },
            { name: 'updateID', permissions: ['ADMIN'] },
        ]
    },
    {
        name      : 'Usuario',
        dataSource: 'mongoDev',
        actions   : [
            { name: 'search', permissions: ['ADMIN'] },
            { name: 'findID', permissions: ['ADMIN'] },
            { name: 'updateID', permissions: ['ADMIN'] },
        ]
    },
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
        name: 'licenciasMTO',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
        ]
    },
    {
        name: 'Ubicaciones',
        dataSource: 'mongodb4',
        actions: [
            { name: 'search', permissions: [] },
        ]
    }
]
