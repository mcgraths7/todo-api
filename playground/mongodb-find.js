const { MongoClient} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (e, client) => {
	if (e) {
		console.log('Could not connect to MongoDB server');
	}
	const db = client.db('TodoApp');
	
	// db.collection('Todos').find({complete: false}).toArray().then((dox) => {
	// 	console.log('Todos:');
	// 	console.log(JSON.stringify(dox, undefined, 2));
	// }, (e) => {
	// 	console.log('Unable to fetch documents');
	// });
	
	db.collection('Users').find({name: "Steven"}).toArray().then((dox) => {
		console.log('Users:');
		console.log(dox);
	}, (e) => {
		console.log('Unable to fetch documents');
	});
	
	console.log('Connected to MongoDB server');
	
	client.close();
});