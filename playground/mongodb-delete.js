const { MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (e, client) => {
	if (e) {
		console.log('Could not connect to MongoDB server');
	}
	const db = client.db('TodoApp');


// delete many

// db.collection('Todos').deleteMany({text: 'eat lunch'}).then((docs) => {
// 	if (docs.result.n !== 0) {
// 		console.log(`Successfully removed ${docs.result.n} documents`);
// 	} else {
// 		console.log('No matching documents found');
// 	}
// }, (e) => {
// 	console.log('Unable to fetch records');
// });
//
// db.collection('Todos').deleteOne({text: 'go to the store'}).then((docs) => {
// 	if (docs.result.n !== 0) {
// 		console.log('Successfully removed the first document matching query');
// 	} else {
// 		console.log('No documents found matching query');
// 	}
// });

db.collection('Users').findOneAndDelete({
	_id: new ObjectID("5aa1678470cd0401ca93fa32")
}).then((docs) => {
	console.log(JSON.stringify(docs, undefined, 2));
});
	
	
	console.log('Connected to MongoDB server');
	
	client.close();
});