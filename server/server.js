const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

let todoSchema = new Schema({
	text: String,
	completed: {type: Boolean, default: false},
	completedAt: Number
});

let Todo = mongoose.model('Todo', todoSchema);

let todo = new Todo({
	text: "cook dinner",
});

// todo.save().then((doc) => {
// 	console.log('Saved todo', doc);
// }, (e) => {
// 	console.log('Unable to save document');
// });

todo = new Todo({
	text: 'Feed the cats',
	completed: true,
	completedAt: 308
});

todo.save().then((doc) => {
	console.log('Saved todo', doc);
}, (e) => {
	console.log('Unable to save document');
});