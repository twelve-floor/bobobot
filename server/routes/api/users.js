const UserModel = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const authMiddleware = require('../../auth_middleware');

const handleSuccess = (res, userId) => {
  const payload = { userId };
  const token = jwt.sign(JSON.stringify(payload), secret);
  res.status(200).send({ token });
};

module.exports = app => {
  app.post('/api/users/register', async (req, res) => {
    const hashCost = 10;
    const { email, password } = req.body;

    try {
      const passwordHash = await bcrypt.hash(password, hashCost);
      const user = new UserModel({ email, passwordHash });
      await user.save();
      handleSuccess(res, user.id);
    } catch (error) {
      res.status(400).send({ error });
    }
  });

  app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Email or password is invalid' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      handleSuccess(res, user.id);
    } else {
      return res.status(400).json({ msg: 'Email or password is invalid' });
    }
  });

  app.put('/api/users', authMiddleware, (req, res, next) => {
    UserModel.findById(req.userId)
      .exec()
      .then(user => {
        user.name = req.body.name;
        user.email = req.body.email;

        user
          .save()
          .then(() => res.json(user))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });
};
