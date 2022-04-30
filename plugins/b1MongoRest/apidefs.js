const model = require('../../customdata/models')

const API = {
    routes: [
        // Find all instances of the model matched by filter from the data source.
        {'name': 'search', 'cmd': 'find', 'method': 'get', 'path': '/:model'},
        // Find a model instance by {id} from the data source. HACER: Ver como usar findOne
        {'name': 'findID', 'cmd': 'find', 'method': 'GET', 'path': '/:model/{_id}'},
        // Find first instance of the model matched by filter from the data source.  HACER: Ver como usar findOne
        {'name': 'findOne', 'cmd': 'find', 'method': 'GET', 'path': '/:model/findOne'},
        // PATCH attributes for a model instance and persist it into the data source.
        {'name': 'updateID', 'cmd': 'findOneAndUpdate', 'method': 'PATCH', 'path': '/:model/{_id}'},
        // Update an existing model instance or insert a new one into the data source based on the where criteria.
        {'name': 'upsert', 'cmd': 'update', 'method': 'POST', 'path': '/:model/upsert'},
        // Create a new instance of the model and persist it into the data source.
        {'name': 'create', 'cmd': 'insertOne', 'method': 'POST', 'path': '/:model'},
        // Delete a model instance by {id} from the data source.
        {'name': 'removeID', 'cmd': 'remove', 'method': 'DELETE', 'path': '/:model/{_id}'},
    ],
    model
}

module.exports = API