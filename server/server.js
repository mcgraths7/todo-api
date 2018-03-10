const express    = require('express'),
	    bodyParser = require('body-parser'),
			{ObjectID} = require('mongodb');

const {Todo}     = require('./db/models/todos'),
			{User}     = require('./db/models/users');

let app = express();

let port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	})
});

app.get('/todos/:id', (req, res) => {
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send('id invalid');
	}
	Todo.findById(req.params.id).then((todo) => {
		if (!todo) {
			return res.status(404).send('todo not found');
		}
		res.status(200).send({todo});
	}, (err) => {
		res.status(400).send('error');
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

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

module.exports = {app};