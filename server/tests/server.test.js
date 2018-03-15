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
			.set('x-auth', testUsers[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect((response) => {
				expect(response.body.text).toBe(text);
			})
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todos = await Todo.find({text});
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				} catch (e) {
					done(e);
				}
			});
	});
	
	test('should trim the leading and trailing white space from input', (done) => {
		let text = '   This is a new todo    ';
		request(app)
			.post('/todos')
			.set('x-auth', testUsers[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect((response) => {
				expect(response.body.text).toBe('This is a new todo');
			})
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todos = await Todo.find({text: "This is a new todo"});
					expect(todos.length).toBe(1);
					done();
				} catch (e) {
					done(e);
				}
			});
	});
	
	test('should not create a todo with invalid body argument', (done) => {
		request(app)
			.post('/todos')
			.set('x-auth', testUsers[0].tokens[0].token)
			.send({})
			.expect(400)
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todos = await Todo.find();
					expect(todos.length).toBe(2);
					done();
				} catch (e) {
					done(e);
				}
			});
	});
});

describe('GET /todos', () => {
	test('should return all todos', (done) => {
		request(app)
			.get('/todos')
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(200)
			.expect((response) => {
				expect(response.body.todos.length).toBe(1)
			})
			.end(done);
	});
});

// 3 test cases - valid request, valid object id but not found in database, invalid object id

describe('GET /todos/:id', () => {
	let validHexID = testTodos[0]._id.toHexString();
	let unownedHexID = testTodos[1]._id.toHexString();
	let invalidHexID = new ObjectID('5aa438b4f5c25f4d70be2a9b').toHexString() + '11';
	let validHexID2 = new ObjectID('5aa438b4f5c25f4d70be2a9e').toHexString();
	
	
	test('should return specified todo', (done) => {
		request(app)
			.get(`/todos/${validHexID}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(200)
			.expect((response) => {
				expect(response.body.todo.text).toBe('First test todo');
			})
			.end(done);
	});
	
	test('should return 404 status code on invalid object id', (done) => {
		request(app)
			.get(`/todos/${invalidHexID}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	test('should return 404 when pass a valid object id, but id is not found in database', (done) => {
		request(app)
			.get(`/todos/${validHexID2}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	test('should not return a todo owned by another user', (done) => {
		request(app)
			.get(`/todos/${unownedHexID}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});



// 3 test cases - object found and deleted, object not found, invalid objectID

describe('DELETE /todos/:id', () => {
	let hexID = testTodos[1]._id.toHexString();
	
	test('should remove specified todo', (done) => {
		request(app)
			.delete(`/todos/${hexID}`)
			.set('x-auth', testUsers[1].tokens[0].token)
			.expect(200)
			.expect((response) => {
				expect(response.body.todo._id).toBe(hexID);
			})
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todo = await Todo.findById(hexID);
					expect(todo).toBe(null);
					done()
				} catch (e) {
					done(e)
				}
			});
	});
	
	test('should not remove todo owned by another user', (done) => {
		request(app)
			.delete(`/todos/${hexID}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	test('should return 404 status code on invalid object id', (done) => {
		request(app)
			.delete('/todos/115aa438b4f5c25f4d70be2a9b')
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	test('should return 404 when pass a valid object id, but id is not found in database', (done) => {
		request(app)
			.delete('/todos/6aa438b4f5c25f4d70be2a9b')
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	let hexID = testTodos[0]._id.toHexString();
	let hexID2 = testTodos[1]._id.toHexString();
	let update = {
		text: "completed todo",
		completed: true
	};
	let update2 = {
		text: 'todo incomplete',
		completed: false
	};
	
	test('should update the specified todo to complete', (done) => {
		request(app)
			.patch(`/todos/${hexID}`)
			.set('x-auth', testUsers[0].tokens[0].token)
			.send(update)
			.expect(200)
			.expect((response) => {
				expect(response.body.todo.completed).toBe(true);
				expect(response.body.todo.completedAt).toBeTruthy();
			})
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todo = await Todo.findById(hexID);
					expect(todo.completed).toBe(true);
					done();
				} catch (e) {
					done(e);
				}
			});
	});
	
	test('should update the specified todo to incomplete, clearing completedAt field', (done) => {
		request(app)
			.patch(`/todos/${hexID2}`)
			.set('x-auth', testUsers[1].tokens[0].token)
			.send(update2)
			.expect(200)
			.expect((response) => {
				expect(response.body.todo.completed).toBe(false);
				expect(response.body.todo.completedAt).toBeNull();
			})
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const todo = await Todo.findById(hexID2);
					expect(todo.completed).toBe(false);
					expect(todo.completedAt).toBeNull();
					done()
				} catch (e) {
					done(e);
				}
			});
	});
	
	test('should not let user update unowned todo', (done) => {
		request(app)
			.patch(`/todos/${hexID}`)
			.set('x-auth', testUsers[1].tokens[0].token)
			.send(update)
			.expect(404)
			.end(done);
	});
	
});

describe('GET /users/me', () => {
	let authUser = testUsers[0];
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
			.end(async (err) => {
				if (err) {
					return done(err);
				}
				try {
					const user = await User.findOne({email});
					expect(user).toBeTruthy();
					expect(user.password === password).toBeFalsy();
					done();
				} catch (e) {
					done(e);
				}
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
	test('should login and return a token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: testUsers[1].email,
				password: testUsers[1].password
			})
			.expect(200)
			.expect((response) => {
				expect(response.headers['x-auth']).toBeTruthy();
			})
			.end(async (err, response) => {
				if (err) {
					done(err);
				}
				try {
					const user = await User.findById(testUsers[1]._id)
					expect(user.tokens[1]).toHaveProperty("token", response.headers['x-auth']);
					expect(user.tokens[1]).toHaveProperty("access", "auth");
					done();
				} catch (e) {
					done(e);
				}
			})
	});

	test('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: testUsers[1].email,
				password: testUsers[1].password +'1'
			})
			.expect(400)
			.expect((response) => {
				expect(response.headers['x-auth']).toBeFalsy();
			})
			.end(async (err) => {
				if (err) {
					done(err);
				}
				try {
					const user = await User.findById(testUsers[1]._id);
					expect(user.tokens.length).toBe(1);
					done();
				} catch (e) {
					done(e);
				}
			});
	});
});

describe('DELETE /users/me/token', () => {
	
	test('should remove token from tokens property', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', testUsers[0].tokens[0].token)
			.expect(200)
			.end(async (err) => {
				if (err) {
					return done(err)
				}
				try {
					const user = await User.findById(testUsers[0]._id);
					expect(user.tokens.length).toBe(0);
					done()
				} catch (e) {
					done(e);
				}
			});
	});
	
	test('should return 401 when user is not authenticated', (done) => {
		request(app)
			.delete('/users/me/token')
			.expect(401)
			.end(done);
	});
});