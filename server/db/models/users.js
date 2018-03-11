const mongoose  = require('mongoose'),
			validator = require('validator'),
			jwt       = require('jsonwebtoken'),
			_         = require('lodash'),
			bcrypt    = require('bcryptjs');

const Schema = mongoose.Schema;
const SALT_FACTOR = 12;



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

// Instance Methods
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

UserSchema.methods.removeToken = function(token) {
	let user = this;
	return user.update({
		$pull: {
			tokens: {
				token
			}
		}
	})
};

// Model Methods
UserSchema.statics.findByToken = function(token) {
	let User = this;
	let decoded;
	
	try {
		decoded = jwt.verify(token, 'sinatra');
	} catch (e) {
		return Promise.reject();
	}
	
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
};

UserSchema.statics.findByCredentials = function(email, password) {
	let User = this;
	return User.findOne({email}).then((user) => {
		if (!user) {
			return Promise.reject();
		}
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, response) => {
				if (response) {
					resolve(user);
				} else {
					reject();
				}
			});
		});
	});
};

UserSchema.pre('save', function(next) {
	let user = this;
	if (!user.isModified('password')) {
		return next();
	} else {
		bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) return next(err);
				user.password = hash;
				next()
			});
		});
	}
});



let User = mongoose.model('User', UserSchema);

module.exports = {User};
