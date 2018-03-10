const express    = require('express'),
	    bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose'),
			{Todo}     = require('./db/models/todos'),
			{User}     = require('./db/models/users');

let app = express();

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
	let Todos = Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	})
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

app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});

module.exports = {app};