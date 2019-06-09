const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorizaton denied' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const { userId } = decoded;
    req.userId = userId;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;
