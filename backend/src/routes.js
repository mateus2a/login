const express = require('express');

const routes = express.Router();

const authMiddleware = require('./app/middlewares/auth');

const SessionController = require('./app/controllers/SessionController');
const UserController = require('./app/controllers/UserController');

routes.post('/authenticate', SessionController.store);
routes.post('/forgot_password', UserController.edit);
routes.post('/reset_password', UserController.update);

routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.delete('/users/:id', UserController.destroy);

module.exports = routes;
