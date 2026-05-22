/**
 * API Client
 * Core HTTP client for making API requests
 */

class APIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || API_CONFIG.BASE_URL;
    this.timeout = config.timeout || API_CONFIG.TIMEOUT;
    this.headers = config.headers || {};
    this.token = null;
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.token = token;
    if (token) {
      this.headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${token}`;
    } else {
      delete this.headers[API_CONFIG.HEADERS.AUTHORIZATION];
    }
  }

  /**
   * Build full URL from endpoint
   */
  buildURL(endpoint, params = {}) {
    let url = `${this.baseURL}${endpoint}`;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, encodeURIComponent(params[key]));
    });
    
    return url;
  }

  /**
   * Build query string from object
   */
  buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }
    
    const query = Object.keys(params)
      .filter(key => params[key] !== null && params[key] !== undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    return query ? `?${query}` : '';
  }

  /**
   * Get cache key for request
   */
  getCacheKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data || {})}`;
  }

  /**
   * Get cached response
   */
  getFromCache(key) {
    if (!API_CONFIG.CACHE.ENABLED) {
      return null;
    }
    
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > API_CONFIG.CACHE.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Save to cache
   */
  saveToCache(key, data) {
    if (!API_CONFIG.CACHE.ENABLED) {
      return;
    }
    
    // Limit cache size
    if (this.cache.size >= API_CONFIG.CACHE.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, options = {}) {
    const {
      params = {},
      query = {},
      data = null,
      headers = {},
      useCache = method === 'GET',
      retries = 0
    } = options;

    try {
      // Build URL
      const url = this.buildURL(endpoint, params) + this.buildQueryString(query);
      
      // Check cache for GET requests
      if (useCache && method === 'GET') {
        const cacheKey = this.getCacheKey(method, url, data);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Prepare request options
      const requestOptions = {
        method,
        headers: {
          [API_CONFIG.HEADERS.CONTENT_TYPE]: 'application/json',
          [API_CONFIG.HEADERS.ACCEPT]: 'application/json',
          ...this.headers,
          ...headers
        }
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      requestOptions.signal = controller.signal;

      // Make request
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle response
      const responseData = await this.handleResponse(response);

      // Cache successful GET requests
      if (useCache && method === 'GET' && response.ok) {
        const cacheKey = this.getCacheKey(method, url, data);
        this.saveToCache(cacheKey, responseData);
      }

      return responseData;

    } catch (error) {
      // Retry on failure
      if (retries < API_CONFIG.RETRY.MAX_ATTEMPTS) {
        const delay = API_CONFIG.RETRY.DELAY_MS * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, retries);
        await this.sleep(delay);
        return this.request(method, endpoint, { ...options, retries: retries + 1 });
      }

      throw this.handleError(error);
    }
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        data
      };
    }

    return data;
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.name === 'AbortError') {
      return new Error(API_CONFIG.ERROR_MESSAGES.TIMEOUT);
    }

    if (!navigator.onLine) {
      return new Error(API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
    }

    if (error.status) {
      switch (error.status) {
        case API_CONFIG.STATUS_CODES.UNAUTHORIZED:
          return new Error(API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED);
        case API_CONFIG.STATUS_CODES.FORBIDDEN:
          return new Error(API_CONFIG.ERROR_MESSAGES.FORBIDDEN);
        case API_CONFIG.STATUS_CODES.NOT_FOUND:
          return new Error(API_CONFIG.ERROR_MESSAGES.NOT_FOUND);
        case API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS:
          return new Error(API_CONFIG.ERROR_MESSAGES.RATE_LIMIT);
        case API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR:
        case API_CONFIG.STATUS_CODES.SERVICE_UNAVAILABLE:
          return new Error(API_CONFIG.ERROR_MESSAGES.SERVER_ERROR);
        default:
          return new Error(error.data?.message || API_CONFIG.ERROR_MESSAGES.INVALID_REQUEST);
      }
    }

    return error;
  }

  /**
   * Sleep utility for retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, { ...options, data });
  }

  put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, { ...options, data });
  }

  patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, { ...options, data });
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}
