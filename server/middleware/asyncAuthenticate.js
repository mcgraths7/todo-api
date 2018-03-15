const {User} = require('../db/models/users');


// let authenticate = (req, res, next) => {
// 	let token = req.header('x-auth');
// 	User.findByToken(token).then((user) => {
// 		if (!user) {
// 			return Promise.reject()
// 		}
// 		req.user = user;
// 		req.token = token;
// 		next();
// 	}).catch((e) => {
// 		res.status(401).send();
// 	});
// };

let asyncAuthenticate = async (req, res, next) => {
	try{
		const token = req.header('x-auth');
		const user = await User.findByToken(token);
		req.user = user;
		req.token = token;
		next();
	} catch (e) {
		res.status(401).send();
	}
};

module.exports = {asyncAuthenticate};