const expect    = require('expect'),
			request = require('supertest');

const {app}  = require('../server'),
			{Todo} = require('../db/models/todos'),
			{User} = require('../db/models/users');
			
beforeEach((done) => {
	Todo.remove({}).then(() => done());
});

describe('POST /todos', () => {
	it('should create a todo', (done) => {
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
				
				Todo.find().then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((err) => done(err));
			});
	});
	it('should trim the leading and trailing white space from input', (done) => {
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
				Todo.find().then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe('This is a new todo');
					done();
				}).catch((err) => done(err));
			});
	});
	it('should not create a todo with invalid body argument', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find().then((todos) => {
					expect(todos.length).toBe(0);
					done();
				}).catch((err) => done(err));
			});
	});
});
