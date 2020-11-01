const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../../modules/mailer');
const authConfig = require('../../config/auth.json');

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
  async edit(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.status(400).send({ error: 'User not found' });

      const token = crypto.randomBytes(20).toString('hex');

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.findByIdAndUpdate(user.id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      mailer.sendMail({
        to: email,
        from: 'mateus@gotrybe.com.br',
        template: 'auth/forgot_password',
        context: { token },
      }, err => {
        if (err) return res.status(400).send({ error: 'Cannot send forgot password email' });

        return res.send();
      });
    } catch (err) {
      return res.status(400).send({ error: 'Error on forgot password, try again' });
    }

    return res.send();
  },
  async update(req, res) {
    const { email, token, password } = req.body;
    try {
      const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

      if (!user) return res.status(400).send({ error: 'User not found' });

      if (token !== user.passwordResetToken) return res.status(400).send({ error: 'Token invalid' });

      const now = new Date();

      if (now > user.passwordResetExpires) return res.status(400).send({ error: 'Token expired, generate a new one' });

      user.password = password;

      await user.save();

      return res.send();
    } catch (err) {
      return res.status(400).send({ error: 'Error reset password, try again' });
    }
  },
  async destroy(req, res) {
    await User.findByIdAndRemove(req.params.id);
    return res.send();
  },
};
