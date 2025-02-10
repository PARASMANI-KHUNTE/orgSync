const jsonwebtoken = require('jsonwebtoken');

const generateToken = async (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}


const generateTokenForPassword = (userId) => {
  const secretKey = process.env.JWT_SECRET;
  const token = jsonwebtoken.sign(
    { userId }, // payload
    secretKey,
    { expiresIn: '1h' } // token valid for 24 hours
  );
  return token;
};



const tokenVerify = (token) => {
  if (!token || typeof token !== 'string') {
    throw new jsonwebtoken.JsonWebTokenError('Token must be a string');
  }

  try {
    const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return {  payload, isValid: true };
  } catch (err) {
    return { payload: null, isValid: false };
  }
};
module.exports = { generateToken, tokenVerify ,generateTokenForPassword};