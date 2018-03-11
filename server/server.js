require('./config/config');
require('./db/mongoose');

const express    = require('express'),
	    bodyParser = require('body-parser'),
			{ObjectID} = require('mongodb'),
			_          = require('lodash'),
			bcrypt     = require('bcryptjs');

const {Todo}         = require('./db/models/todos'),
			{User}         = require('./db/models/users'),
			{authenticate} = require('./middleware/authenticate');

let app = express();

let port = process.env.PORT;

app.use(bodyParser.json());

// Routes for Todos
app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	})
});

app.get('/todos/:id', (req, res) => {
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send();
	}
	Todo.findById(req.params.id).then((doc) => {
		if (!doc) {
			return res.status(404).send();
		}
		res.status(200).send({doc});
	}, (err) => {
		res.status(400).send();
	});
});

app.post('/todos', (req, res) => {
	let todo = new Todo({
		text: req.body.text
	});
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	})
});

app.delete('/todos/:id', (req, res) => {
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send();
	}
	Todo.findByIdAndRemove(req.params.id).then((doc) => {
		if (!doc) {
			return res.status(404).send();
		}
		res.status(200).send({doc});
	}).catch((e) => {
		res.status(400).send();
	});
});

app.patch('/todos/:id', (req, res) => {
	let objID = req.params.id;
	let body = _.pick(req.body, ['text', 'completed']);
	
	if (!ObjectID.isValid(objID)) {
		return res.status(404).send();
	}
	
	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}
	
	Todo.findByIdAndUpdate(objID, {$set: body}, {new: true}).then((doc) => {
			if (!doc) {
				return res.status(404).send();
			}
			res.status(200).send({doc});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

// Routes for Users

app.get('/users', (req, res) => {
	User.find().then((users) => {
		res.send({users});
	}, (e) => {
		res.status(400).send(e);
	})
});

app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	let user = new User({
		email: body.email,
		password: body.password
	});
	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send(req.user);
	}, () => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

module.exports = {app};