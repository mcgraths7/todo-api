const request    = require('supertest'),
			{ObjectID} = require('mongodb');

const {app}                                                = require('../server'),
			{Todo}                                               = require('../db/models/todos'),
			{User}                                               = require('../db/models/users'),
			{testTodos, populateTodos, testUsers, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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
	let validHexID = testTodos[0]._id.toHexString();
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
	let hexID = testTodos[0]._id.toHexString();
	
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
	let hexID = testTodos[0]._id.toHexString();
	let hexID2 = testTodos[1]._id.toHexString();
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

describe('GET /users/me', () => {
	let authUser = testUsers[0];
	let unauthUser = testUsers[1];
	let authUserToken = authUser.tokens[0].token;
	
	test('should allow authenticated user to access', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', authUserToken)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(authUser._id.toHexString());
				expect(res.body.email).toBe(authUser.email);
			})
			.end(done);
	});
	
	test('should not allow unauthenticated user to access', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {
	test('should create a user', (done) => {
		let email = 'example@example.com';
		let password = '1234567890';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if (err) {
					return done(err);
				}
				User.findOne({email}).then((user) => {
					expect(user).toBeTruthy();
					expect(user.password === password).toBeFalsy();
					done();
				}).catch((err) => done(err));
			});
	});
	
	test('should return validation error if data is invalid', (done) => {
		let email = 'thisisnotanemail';
		let password = '1234567890';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});

	test('should not create user if email is in use', (done) => {
		let email = 'me@example.com';
		let password = '1234567890';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	})
});

describe('POST /login', () => {
	test('it should login and return a token', (done) => {
		request(app)
			.post('/login')
			.send({
			email: testUsers[1].email,
			password: testUsers[1].password
		})
			.expect(200)
			.expect((response) => {
				expect(response.headers['x-auth']).toBeTruthy();
			})
			.end((err, response) => {
				if (err) {
					done(err);
				}

				User.findById(testUsers[1]._id).then((user) => {
					// debugger;
					expect(user.tokens[0]).toHaveProperty("token", response.headers['x-auth']);
					expect(user.tokens[0]).toHaveProperty("access", "auth");
					done();
				}).catch((err) => done(err));
			})
	});

	test('it should reject invalid login', (done) => {
		request(app)
			.post('/login')
			.send({
				email: testUsers[1].email,
				password: 'invalid'
			})
			.expect(400)
			.expect((response) => {
				expect(response.headers['x-auth']).toBeFalsy();
			})
			.end((err, response) => {
				if (err) {
					done(err);
				}
				
				User.findById(testUsers[1]._id).then((user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch((e) => done(e));
			});
	});
});
