const {SHA256} = require('crypto-js'),
			jwt      = require('jsonwebtoken'),
			bcrypt   = require('bcryptjs');

// let data = {
// 	id: 10
// };

// let token = jwt.sign(data, 'sinatra');
// // jwt.verify(token);
// // let message = 'I am a user';
// // let hashedMessage = SHA256(message).toString();
// //
// // // console.log(message);
// // //
// // // console.log(hashedMessage);
// //
// //
// // let data = {
// // 	id: 4
// // };
// //
// // let token = {
// // 	data,
// // 	hash: SHA256(JSON.stringify(data) + 'secret').toString()
// // };
// //
// //
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
// // let resultHash = SHA256(JSON.stringify(token.data) + 'secret').toString();
// //
// // if (resultHash === token.hash) {
// // 	console.log('Data was not changed');
// // } else {
// // 	console.log('Data was changed');
// // }
//
// console.log(token);
// data.id = 11;
// console.log(jwt.verify(token, 'sinatra'));


let password = '123456789';

bcrypt.genSalt(10, (err, salt) => {
	bcrypt.hash(password, salt, (err, hash) => {
		console.log(hash);
	});
});

let hashedPassword = `$2a$10$WHRq19aH11iDbtZxQ6la5uC5zEJn1tRzVMVSQNZ7iCRNUTS5uRZFq`;

bcrypt.compare(password, hashedPassword, (err, response) => {
	console.log(response);
});