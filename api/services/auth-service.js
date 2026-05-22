/**
 * Authentication Service
 * Handles user authentication and authorization
 */

class AuthService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  async register(userData) {
    const response = await this.client.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName
    });

    // Store token after successful registration
    if (response.token) {
      this.client.setAuthToken(response.token);
      this.storeToken(response.token);
    }

    return response;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials) {
    const response = await this.client.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password
    });

    // Store token after successful login
    if (response.token) {
      this.client.setAuthToken(response.token);
      this.storeToken(response.token);
    }

    return response;
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout() {
    try {
      await this.client.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear token regardless of API response
      this.client.setAuthToken(null);
      this.clearToken();
    }
  }

  /**
   * Refresh authentication token
   * POST /auth/refresh
   */
  async refreshToken(refreshToken) {
    const response = await this.client.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken
    });

    if (response.token) {
      this.client.setAuthToken(response.token);
      this.storeToken(response.token);
    }

    return response;
  }

  /**
   * Verify email address
   * POST /auth/verify-email
   */
  async verifyEmail(verificationCode) {
    return await this.client.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, {
      code: verificationCode
    });
  }

  /**
   * Request password reset
   * POST /auth/reset-password
   */
  async resetPassword(email) {
    return await this.client.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      email
    });
  }

  /**
   * Change password
   * POST /auth/change-password
   */
  async changePassword(currentPassword, newPassword) {
    return await this.client.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Store token in localStorage
   */
  storeToken(token) {
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get stored token
   */
  getStoredToken() {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  clearToken() {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getStoredToken();
  }

  /**
   * Initialize auth from stored token
   */
  initializeAuth() {
    const token = this.getStoredToken();
    if (token) {
      this.client.setAuthToken(token);
    }
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
