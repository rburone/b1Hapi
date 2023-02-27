module.exports = {
    User: [
        {name: 'search', permissions: ['ADMIN']},
        {name: 'findID', permissions: ['ADMIN']},
        {name: 'updateID', permissions: ['ADMIN']},
    ],
    lugar: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: ['USER']},
        {name: 'updateID', permissions: ['USER']},
    ],
    activo_lineal: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: ['USER']},
        {name: 'updateID', permissions: ['USER']},
    ],
    material: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: []},
        {name: 'updateID', permissions: []},
        {name: 'replaceID', permissions: []},
        {name: 'create', permissions: ['USER']},
    ],
    material_view: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: ['USER']},
    ],
    tramitesae_view: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: ['USER']},
    ],
    tramitesae: [
        {name: 'search', permissions: []},
        {name: 'findID', permissions: ['USER']},
        {name: 'updateID', permissions: ['USER']},
        {name: 'create', permissions: ['USER']},
    ],
}