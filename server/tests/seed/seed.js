const {ObjectID} = require('mongodb'),
			jwt        = require('jsonwebtoken');

const {Todo} = require('../../db/models/todos'),
			{User} = require('../../db/models/users');

const testTodos = [
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9b'),
		text: "First test todo",
		completed: true,
		completedAt: 123
	},
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9c'),
		text: "Second test todo",
		completed: false
	},
	{text: "Third test todo"}
];

const userOneObjId = new ObjectID();
const userTwoObjId = new ObjectID();
const testUsers = [
	{
		_id: userOneObjId,
		email: 'me@example.com',
		password: 'password123',
		tokens: [{
			access: 'auth',
			token: jwt.sign({_id: userOneObjId, access: 'auth'}, 'sinatra').toString()
		}]
	},
	{
		_id: userTwoObjId,
		email: 'me2@example.com',
		password: 'passwordabc'
	}
];

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		Todo.insertMany(testTodos)
	}).then(() => done());
};

const populateUsers = (done) => {
	User.remove({}).then(() => {
		let userOne = new User(testUsers[0]).save();
		let userTwo = new User(testUsers[1]).save();
		
		return Promise.all([userOne, userTwo])
	}).then(() => done());
};

module.exports = {
	testTodos,
	populateTodos,
	testUsers,
	populateUsers
};