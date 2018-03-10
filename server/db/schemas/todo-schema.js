const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let todoSchema = new Schema({
	text: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
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

module.exports = {todoSchema};