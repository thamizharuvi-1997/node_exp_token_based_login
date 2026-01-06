const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'node-auth-api',
    audience: 'node-auth-client'
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'node-auth-api',
      audience: 'node-auth-client'
    });
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'node-auth-api',
      audience: 'node-auth-client'
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const generateTokenPair = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    type: 'access'
  };

  const accessToken = generateAccessToken(payload);
  const refreshTokenValue = generateRefreshToken();
  
  const refreshPayload = {
    userId: user.id,
    tokenId: crypto.randomUUID(),
    type: 'refresh'
  };

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'node-auth-api',
    audience: 'node-auth-client'
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair
};
