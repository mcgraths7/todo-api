const request    = require('supertest'),
			{ObjectID} = require('mongodb');

const {app}  = require('../server'),
			{Todo} = require('../db/models/todos');
const seedData = [
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9b'),
		text: "First test todo",
		completed: true,
		completedAt: 123
	},
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9c'),
		text: "Second test todo",
		completed: false
	},
	{text: "Third test todo"}
];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		Todo.insertMany(seedData)
	}).then(() => done());

});

describe('POST /todos', () => {
	test('should create a todo', (done) => {
		let text = "This is a new todo";
		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((response) => {
				expect(response.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((err) => done(err));
			});
	});
	test('should trim the leading and trailing white space from input', (done) => {
		let text = '   This is a new todo    ';
		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((response) => {
				expect(response.body.text).toBe('This is a new todo');
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find({text: "This is a new todo"}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe('This is a new todo');
					done();
				}).catch((err) => done(err));
			});
	});
	test('should not create a todo with invalid body argument', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find().then((todos) => {
					expect(todos.length).toBe(3);
					done();
				}).catch((err) => done(err));
			});
	});
});

describe('GET /todos', () => {
	test('should return all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((response) => {
				expect(response.body.todos.length).toBe(3)
			})
			.end(done);
	});
});

// 3 test cases - valid request, valid object id but not found in database, invalid object id

describe('GET /todos/:id', () => {
	let validHexID = seedData[0]._id.toHexString();
	let invalidHexID = new ObjectID('5aa438b4f5c25f4d70be2a9b').toHexString() + '11';
	let validHexID2 = new ObjectID('5aa438b4f5c25f4d70be2a9e').toHexString();
	
	
	test('should return specified todo', (done) => {
		request(app)
			.get(`/todos/${validHexID}`)
			.expect(200)
			.expect((response) => {
				expect(response.body.doc.text).toBe('First test todo');
			})
			.end(done);
	});
	
	test('should return 404 status code on invalid object id', (done) => {
		request(app)
			.get(`/todos/${invalidHexID}`)
			.expect(404)
			.end(done);
	});
	
	test('should return 404 when pass a valid object id, but id is not found in database', (done) => {
		request(app)
			.get(`/todos/${validHexID2}`)
			.expect(404)
			.end(done);
	});
});

// 3 test cases - object found and deleted, object not found, invalid objectID

describe('DELETE /todos/:id', () => {
	let hexID = seedData[0]._id.toHexString();
	
	test('should remove specified todo', (done) => {
		request(app)
			.delete(`/todos/${hexID}`)
			.expect(200)
			.expect((response) => {
				expect(response.body.doc._id).toBe(hexID);
			})
			.end((err, res) => {
				if (err){
					return done(err);
				}
				Todo.findById(hexID).then((doc) => {
					expect(doc).toBe(null);
					done();
				}).catch((e) => done(e));
			});
	});
	
	test('should return 404 status code on invalid object id', (done) => {
		request(app)
			.delete('/todos/115aa438b4f5c25f4d70be2a9b')
			.expect(404)
			.end(done);
	});
	
	test('should return 404 when pass a valid object id, but id is not found in database', (done) => {
		request(app)
			.delete('/todos/6aa438b4f5c25f4d70be2a9b')
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	let hexID = seedData[0]._id.toHexString();
	let hexID2 = seedData[1]._id.toHexString();
	let update = {
		text: "updated todo",
		completed: true
	};
	
	test('should update the specified todo to complete', (done) => {
		request(app)
			.patch(`/todos/${hexID}`)
			.send(update)
			.expect(200)
			.expect((response) => {
				expect(response.body.doc.completed).toBe(true);
				expect(response.body.doc.completedAt).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexID).then((doc) => {
					expect(doc.completed).toBe(true);
					done()
				}).catch((e) => done(e));
			});
	});
	let update2 = {
		completed: false
	};
	
	test('should update the specified todo to incomplete, clearing completedAt field', (done) => {
		request(app)
			.patch(`/todos/${hexID2}`)
			.send(update2)
			.expect(200)
			.expect((response) => {
				expect(response.body.doc.completed).toBe(false);
				expect(response.body.doc.completedAt).toBeNull();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexID2).then((doc) => {
					expect(doc.completed).toBe(false);
					expect(doc.completedAt).toBeNull();
					done()
				}).catch((e) => done(e));
			});
	})
});
