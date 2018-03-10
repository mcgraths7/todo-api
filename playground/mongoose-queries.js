const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose'),
			{Todo}     = require('../server/db/models/todos'),
			{User}     = require('../server/db/models/users');

// let objectID = '5aa41bbc29843d478532d6a3';
//
// if (!ObjectID.isValid(objectID)) {
// 	console.log('ID not valid');
// }
//Todo find
// Todo.find({_id: objectID}).then((todos) => {
// 	if (todos[0] === null) {
// 		return console.log('No results match query')
// 	}
// 	console.log('All todos matching query:', todos);
// });
//
// //Todo findOne
// Todo.findOne({_id: objectID}).then((todo) => {
// 	if (!todo) {
// 		return console.log('To do not found');
// 	}
// 	console.log('First matching to do:', JSON.stringify(todo, undefined, 2));
// });
//
// //Todo findByID
// Todo.findById(objectID).then((todo) => {
// 	if (!todo) {
// 		return console.log('ID not found');
// 	}
// 	console.log('To do by ID:', JSON.stringify(todo, undefined, 2));
// }).catch((e) => {
// 	console.log(e);
// });

let objectID = '5aa42c2adb730d4ad1c4f13b';


// User.findById(objectID).then((user) => {
// 	if (!user) {
// 		return console.log('ID does not match a user in database');
// 	}
// 	console.log('User found:', JSON.stringify(user, undefined, 2));
// }, (err) => {
// 	console.log(err);
// });

