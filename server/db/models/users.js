const mongoose = require('mongoose');
const { userSchema } = require('../schemas/users-schema');


let User = mongoose.model('User', userSchema);

module.exports = {User};