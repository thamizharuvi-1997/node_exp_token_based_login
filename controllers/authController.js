const { User, RefreshToken } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { 
  setAccessTokenCookie, 
  setRefreshTokenCookie, 
  clearAuthCookies 
} = require('../utils/cookies');
const { Op } = require('sequelize');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName
      });

      const { accessToken, refreshToken } = generateTokenPair(user);

      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      await user.update({ lastLoginAt: new Date() });

      const { accessToken, refreshToken } = generateTokenPair(user);

      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.cookies;
      
      if (!refresh_token) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const storedToken = await RefreshToken.findOne({
        where: {
          token: refresh_token,
          isRevoked: false,
          expiresAt: { [Op.gt]: new Date() }
        },
        include: [{ model: User, as: 'user' }]
      });

      if (!storedToken || !storedToken.user) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      const decoded = verifyRefreshToken(refresh_token);

      const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(storedToken.user);

      await RefreshToken.update(
        { isRevoked: true },
        { where: { id: storedToken.id } }
      );

      await RefreshToken.create({
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, newRefreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthCookies(res);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  static async logout(req, res) {
    try {
      const { refresh_token } = req.cookies;
      
      if (refresh_token) {
        await RefreshToken.update(
          { isRevoked: true },
          { where: { token: refresh_token } }
        );
      }

      clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  static async logoutAll(req, res) {
    try {
      const userId = req.user.id;
      
      await RefreshToken.update(
        { isRevoked: true },
        { where: { userId } }
      );

      clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout all'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
