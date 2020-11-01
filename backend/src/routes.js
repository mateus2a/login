const express = require('express');

const routes = express.Router();

const SessionController = require('./app/controllers/SessionController');
const UserController = require('./app/controllers/UserController');

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.destroy);

module.exports = routes;
