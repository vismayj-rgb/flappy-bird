/**
 * Authentication Controller
 * Handles authentication business logic
 */

const authService = require('../services/auth.service');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    const result = await authService.registerUser({
      username,
      email,
      password,
      displayName
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.loginUser(email, password);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await authService.logoutUser(userId);
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    const result = await authService.refreshAuthToken(refreshToken);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    await authService.verifyUserEmail(code);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    await authService.requestPasswordReset(email);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    await authService.changeUserPassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
