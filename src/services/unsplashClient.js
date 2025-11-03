// Unsplash API Client Configuration

const UNSPLASH_API_BASE_URL = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

/**
 * Make authenticated requests to Unsplash API
 * @param {string} endpoint - API endpoint (e.g., '/photos')
 * @param {Object} options - Fetch options (method, params, etc.)
 * @returns {Promise<{data: any, error: Object|null}>}
 */
export const unsplashRequest = async (endpoint, options = {}) => {
  try {
    const url = new URL(`${UNSPLASH_API_BASE_URL}${endpoint}`);

    // Add query parameters
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        url.searchParams.append(key, options.params[key]);
      });
    }

    const headers = {
      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url.toString(), config);
    const responseData = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message: responseData.errors?.[0] || responseData.error || 'Unsplash API request failed',
          details: responseData
        }
      };
    }

    return {
      data: responseData,
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
 * GET request to Unsplash API
 */
export const unsplashGet = async (endpoint, params = {}) => {
  return unsplashRequest(endpoint, { method: 'GET', params });
};

/**
 * Trigger download tracking for Unsplash attribution
 * IMPORTANT: Must be called when user downloads/uses an image
 * @param {string} downloadLocation - Download location URL from photo object
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const triggerDownload = async (downloadLocation) => {
  try {
    // Unsplash requires download tracking for API usage compliance
    const response = await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      return { success: false, error: { message: 'Failed to track download' } };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message || 'Failed to track download' }
    };
  }
};

/**
 * Test Unsplash API connection
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const testUnsplashConnection = async () => {
  const { data, error } = await unsplashGet('/photos', { per_page: 1 });

  if (error) {
    return { success: false, error };
  }

  return { success: true, error: null };
};
