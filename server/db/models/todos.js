const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TodoSchema = new Schema({
	text: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	_creator: {
		type: Schema.Types.ObjectId,
		required: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	completedAt: {
		type: Number,
		default: null
	}
});

let Todo = mongoose.model('Todo', TodoSchema);

module.exports = {Todo};