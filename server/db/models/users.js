const mongoose  = require('mongoose'),
			validator = require('validator'),
			jwt       = require('jsonwebtoken'),
			_         = require('lodash');

const Schema = mongoose.Schema;

let UserSchema = new Schema({
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

UserSchema.methods.toJSON = function() {
	let user = this;
	let userObj = user.toObject();
	
	return _.pick(userObj, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	let user = this;
	let access = 'auth';
	let token = jwt.sign({_id: user._id.toHexString(), access}, 'sinatra').toString();
	user.tokens.push({access, token});
	
	return user.save().then(() => {
		return token;
	});
};

let User = mongoose.model('User', UserSchema);

module.exports = {User};
