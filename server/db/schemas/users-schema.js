const mongoose  = require('mongoose'),
			validator = require('validator');

const Schema = mongoose.Schema;

let userSchema = new Schema({
	email: {
		type: String,
		required: [true, 'Email is required'],
		minlength: 6,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: `{VALUE} is not a valid email!`
		}
	},
	password: {
		type: String,
		minlength: 8,
		required: true
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

module.exports = {userSchema};