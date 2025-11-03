// Printful API Client Configuration

const PRINTFUL_API_BASE_URL = 'https://api.printful.com';
const PRINTFUL_API_TOKEN = process.env.REACT_APP_PRINTFUL_API_TOKEN;

/**
 * Make authenticated requests to Printful API
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<{data: any, error: Object|null}>}
 */
export const printfulRequest = async (endpoint, options = {}) => {
  try {
    const url = `${PRINTFUL_API_BASE_URL}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message: responseData.error?.message || responseData.result || 'Printful API request failed',
          details: responseData
        }
      };
    }

    return {
      data: responseData.result || responseData,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.message || 'Network error occurred',
        details: error
      }
    };
  }
};

/**
 * GET request to Printful API
 */
export const printfulGet = async (endpoint) => {
  return printfulRequest(endpoint, { method: 'GET' });
};

/**
 * POST request to Printful API
 */
export const printfulPost = async (endpoint, body) => {
  return printfulRequest(endpoint, { method: 'POST', body });
};

/**
 * PUT request to Printful API
 */
export const printfulPut = async (endpoint, body) => {
  return printfulRequest(endpoint, { method: 'PUT', body });
};

/**
 * DELETE request to Printful API
 */
export const printfulDelete = async (endpoint) => {
  return printfulRequest(endpoint, { method: 'DELETE' });
};

/**
 * Test Printful API connection
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const testPrintfulConnection = async () => {
  const { data, error } = await printfulGet('/store');

  if (error) {
    return { success: false, error };
  }

  return { success: true, error: null, storeInfo: data };
};
