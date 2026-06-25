const jwt = require('jsonwebtoken');

const SECRET = 'book-drifting-secret-key-2024';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, building: user.building },
    SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
}

module.exports = { signToken, authMiddleware, SECRET };
