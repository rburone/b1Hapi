  // Permissions with ['*'] any rol but needs authentication
  // Permissions with [] not need authentication

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
