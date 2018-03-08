const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (e, client) => {
	if (e) {
		console.log('Unable to connect to MongoDB server');
	}
	console.log('Connected to MongoDB server');
	const db = client.db('TodoApp');
	
	// db.collection('Todos').insertOne({
	// 	text: 'Go to the store',
	// 	complete: false
	// }, (e, res) => {
	// 	if (e) {
	// 		return console.log('Unable to insert document', e);
	// 	}
	// 	console.log(JSON.stringify(res.ops, undefined, 2));
	// });
	
	//Insert new doc into users (name, age, location)
	//
	// db.collection('Users').insertOne({
	// 	name: "Steven",
	// 	age: 27,
	// 	location: "Morrisville"
	// }, (e, res) => {
	// 	if (e) {
	// 		return console.log('Unable to insert document', e);
	// 	}
	// 	console.log(JSON.stringify(res.ops, undefined, 2));
	// });
	
	client.close();
});