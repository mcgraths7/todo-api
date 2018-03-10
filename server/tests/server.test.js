const expect     = require('expect'),
			request    = require('supertest'),
			{ObjectID} = require('mongodb');

const {app}  = require('../server'),
			{Todo} = require('../db/models/todos');
const seedData = [
	{
		_id: new ObjectID('5aa438b4f5c25f4d70be2a9b'),
		text: "First test todo"},
	{text: "Second test todo"},
	{text: "Third test todo"}
];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		Todo.insertMany(seedData)
	}).then(() => done());

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

				Todo.find({text}).then((todos) => {
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
				Todo.find({text: "This is a new todo"}).then((todos) => {
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
					expect(todos.length).toBe(3);
					done();
				}).catch((err) => done(err));
			});
	});
});

describe('GET /todos', () => {
	it('should return all todos', (done) => {
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
	it('should return specified todo', (done) => {
		request(app)
			.get('/todos/5aa438b4f5c25f4d70be2a9b')
			.expect(200)
			.expect((response) => {
				expect(response.body.todo.text).toBe('First test todo');
			})
			.end(done);
	});
	it('should return 404 status code on invalid object id', (done) => {
		request(app)
			.get('/todos/115aa438b4f5c25f4d70be2a9b')
			.expect(404)
			.end(done);
	});
	it('should return 404 when pass a valid object id, but id is not found in database', (done) => {
		request(app)
			.get('/todos/6aa438b4f5c25f4d70be2a9b')
			.expect(404)
			.end(done);
	});
});

