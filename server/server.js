const express    = require('express'),
	    bodyParser = require('body-parser'),
			{ObjectID} = require('mongodb');

const {Todo}     = require('./db/models/todos'),
			{User}     = require('./db/models/users'),
			{mongoose} = require('./db/mongoose');

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
		return res.status(404).send();
	}
	Todo.findById(req.params.id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({todo});
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
	Todo.findByIdAndRemove(req.params.id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});



app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

module.exports = {app};