const model = require('../../customdata/models')

const API = {
    routes: [
        // Find all instances of the model matched by filter from the data source.
        { 'name': 'search', 'cmd': 'find', 'method': 'GET', 'path': '/:model' },
        // Find a model instance by {id} from the data source. // TODO: HACER: Ver como usar findOne
        { 'name': 'findID', 'cmd': 'find', 'method': 'GET', 'path': '/:model/{_id}' },
        // Find first instance of the model matched by filter from the data source. // TODO: HACER: Ver como usar findOne
        { 'name': 'findOne', 'cmd': 'find', 'method': 'GET', 'path': '/:model/findOne' },
        // PATCH attributes for a model instance and persist it into the data source.
        { 'name': 'updateID', 'cmd': 'findOneAndUpdate', 'method': 'PATCH', 'path': '/:model/{_id}' },
        // PATCH attributes for a model instance and persist it into the data source.
        { 'name': 'update', 'cmd': 'findAndUpdate', 'method': 'PATCH', 'path': '/:model' },
        // REPLACE model instance and persist it into the data source.
        { 'name': 'replaceID', 'cmd': 'replaceOne', 'method': 'PUT', 'path': '/:model/{_id}' },
        // REPLACE model instance and persist it into the data source.
        { 'name': 'replace', 'cmd': 'replaceOne', 'method': 'PUT', 'path': '/:model' },
        // Update an existing model instance or insert a new one into the data source based on the where criteria.
        { 'name': 'upsert', 'cmd': 'updateOne', 'method': 'PUT', 'path': '/:model/upsert' },
        // Create a new instance of the model and persist it into the data source.
        { 'name': 'create', 'cmd': 'insertOne', 'method': 'POST', 'path': '/:model' },
        // Delete a model instance by {id} from the data source.
        { 'name': 'deleteID', 'cmd': 'deleteOne', 'method': 'DELETE', 'path': '/:model/{_id}' },
        // Delete a model(s) instance(s) from the data source.
        { 'name': 'delete', 'cmd': 'deleteMany', 'method': 'DELETE', 'path': '/:model' },
        // Drop data source.
        { 'name': 'clear', 'cmd': 'drop', 'method': 'DELETE', 'path': '/:model/clear' },
    ],
    model
}

module.exports = API
