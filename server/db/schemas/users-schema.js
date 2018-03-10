const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
	email: {
		type: String,
		required: true,
		minlength: 7,
		trim: true
	}
});

module.exports = {userSchema};