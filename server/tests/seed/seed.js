const {ObjectID} = require('mongodb'),
			jwt        = require('jsonwebtoken');

const {Todo} = require('../../db/models/todos'),
			{User} = require('../../db/models/users');



const userOneObjId = new ObjectID();
const userTwoObjId = new ObjectID();
const testUsers = [
	{
		_id: userOneObjId,
		email: 'me@example.com',
		password: 'password123',
		tokens: [{
			access: 'auth',
			token: jwt.sign({_id: userOneObjId, access: 'auth'}, process.env.JWT_SECRET).toString()
		}]
	},
	{
		_id: userTwoObjId,
		email: 'me2@example.com',
		password: 'passwordabc',
		tokens: [{
			access: 'auth',
			token: jwt.sign({_id: userTwoObjId, access: 'auth'}, process.env.JWT_SECRET).toString()
		}]
	}
];

const testTodos = [
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9b'),
		text: "First test todo",
		completed: true,
		completedAt: 123,
		_creator: userOneObjId
	},
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9c'),
		text: "Second test todo",
		completed: false,
		_creator: userTwoObjId
	}];

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