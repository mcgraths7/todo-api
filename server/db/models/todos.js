const mongoose = require('mongoose');
const { todoSchema } = require('../schemas/todo-schema');

let Todo = mongoose.model('Todo', todoSchema);

module.exports = {Todo};