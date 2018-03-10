const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose'),
			{Todo}     = require('../server/db/models/todos'),
			{User}     = require('../server/db/models/users');

// Todo.remove({}) - pass in a query and remove all matches

// Todo.findOneAndRemove({query})

// Todo.findByIdAndRemove(id)
