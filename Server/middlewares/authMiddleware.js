// server/src/middleware/authMiddleware.js
const {tokenVerify} = require('../Utils/TokenService')
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied, token missing' });

  try {
    const verified = tokenVerify(token);
    if(!verified.isValid){
      return res.status(404).json({
        success : false,
        message : "invalid user"
      })
    }
    req.user = verified.payload; // Directly assign the payload

    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token', error: err.message });
  }
};

module.exports = {authMiddleware};