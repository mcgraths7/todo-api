const { MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (e, client) => {
	if (e) {
		console.log('Could not connect to MongoDB server');
	}
	const db = client.db('TodoApp');

	//Updating records
	
	//Find one and update - updates a document and returns the updated document
	
	// db.collection('Todos').findOneAndUpdate({text: 'eat lunch'}, {$set: {complete: true}}, {returnOriginal: false}, (e, doc) => {
	// 	console.log(JSON.stringify(doc, undefined, 2));
	// });
	
	db.collection('Users').findOneAndUpdate(
		{
			name: 'Anthony'
		},
		{
			$set: {name: 'Steven'},
			$inc: {age: -1}
		},
		{
			returnOriginal: false
		}, (res) => {
			console.log(JSON.stringify(res, undefined, 2));
		});
	
	console.log('Connected to MongoDB server');
	
	client.close();
});