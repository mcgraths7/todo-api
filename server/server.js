require('./config/config');
require('./db/mongoose');

const express    = require('express'),
	    bodyParser = require('body-parser'),
			{ObjectID} = require('mongodb'),
			_          = require('lodash'),
			bcrypt     = require('bcryptjs');

const {Todo}         = require('./db/models/todos'),
			{User}         = require('./db/models/users'),
			{asyncAuthenticate} = require('./middleware/asyncAuthenticate');

let app = express();

let port = process.env.PORT;

app.use(bodyParser.json());

// Routes for Todos
app.get('/todos', asyncAuthenticate, async (req, res) => {
	try {
		const todos = await Todo.find({_creator: req.user._id});
		res.send({todos});
	} catch (e) {
		res.status(400).send();
	}
});

app.get('/todos/:id', asyncAuthenticate, async (req, res) => {
	let id = req.params.id;
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	try {
		const todo = await Todo.findOne({_id: id, _creator: req.user._id});
		if (!todo) {
			return res.status(404).send()
		}
		res.send({todo});
	} catch (e) {
		res.status(400).send();
	}
});

app.post('/todos', asyncAuthenticate, async (req, res) => {
	try {
		const todo = new Todo({
			text: req.body.text,
			_creator: req.user._id
		});
		await todo.save();
		res.send(todo);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete('/todos/:id', asyncAuthenticate, async (req, res) => {
	const id = req.params.id;
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	try {
		const todo = await Todo.findOneAndRemove({_creator: req.user._id, _id: id});
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	} catch (e) {
		res.status(400).send();
	}
});

app.patch('/todos/:id', asyncAuthenticate, async (req, res) => {
	try {
		let objID = req.params.id;
		let body = _.pick(req.body, ['text', 'completed']);
		
		if (!ObjectID.isValid(objID)) {
			return res.status(404).send()
		}
		if (_.isBoolean(body.completed) && body.completed) {
			body.completedAt = new Date().getTime();
		} else {
			body.completed = false;
			body.completedAt = null;
		}
		const todo = await Todo.findOneAndUpdate({_id: objID, _creator: req.user._id}, {$set: body}, {new: true});
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	} catch (e) {
			res.status(400).send(e);
		}
});

// Routes for Users

app.get('/users', async (req, res) => {
	try {
		const users = await User.find();
		res.send({users});
	} catch (e) {
		res.status(400).send()
	}
});

app.post('/users', async (req, res) => {
	try {
		let body = _.pick(req.body, ['email', 'password']);
		const user = new User({
			email: body.email,
			password: body.password
		});
		await user.save();
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get('/users/me', asyncAuthenticate, (req, res) => {
	res.send(req.user);
});

app.post('/users/login', async (req, res) => {
	try {
		const body = _.pick(req.body, ['email', 'password']);
		const user = await User.findByCredentials(body.email, body.password);
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send();
	}
});

app.delete('/users/me/token', asyncAuthenticate, async (req, res) => {
	try {
		await req.user.removeToken(req.token);
		res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

module.exports = {app};