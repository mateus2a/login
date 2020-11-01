const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

const User = mongoose.model('User');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;
    const users = await User.paginate({}, { page, limit: 10 });

    return res.json(users);
  },
  async store(req, res) {
    const { email } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(400).send({ error: 'User already exists' });
      }

      const user = await User.create(req.body);

      user.password = undefined;

      const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400,
      });

      return res.send({ user, token });
    } catch (err) {
      return res.status(400).send({ error: 'Registration failed!' });
    }
  },
  async update(req, res) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    return res.json(user);
  },
  async destroy(req, res) {
    await User.findByIdAndRemove(req.params.id);
    return res.send();
  },
};
