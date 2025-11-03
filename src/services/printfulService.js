import { printfulGet, printfulPost, printfulPut, printfulDelete } from './printfulClient';

// Printful Service - Handles all Printful API operations

/**
 * Get store information
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getStoreInfo = async () => {
  return await printfulGet('/store');
};

/**
 * Get all available products from Printful catalog
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getProducts = async () => {
  return await printfulGet('/products');
};

/**
 * Get details of a specific product
 * @param {number} productId - Printful product ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getProduct = async (productId) => {
  return await printfulGet(`/products/${productId}`);
};

/**
 * Get variants of a specific product
 * @param {number} productId - Printful product ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getProductVariants = async (productId) => {
  const { data, error } = await printfulGet(`/products/${productId}`);

  if (error) {
    return { data: null, error };
  }

  return { data: data.variants || [], error: null };
};

/**
 * Get all sync products (products created in your Printful store)
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getSyncProducts = async (options = {}) => {
  let endpoint = '/store/products';

  const params = new URLSearchParams();
  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return await printfulGet(endpoint);
};

/**
 * Get a specific sync product
 * @param {number} syncProductId - Sync product ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getSyncProduct = async (syncProductId) => {
  return await printfulGet(`/store/products/${syncProductId}`);
};

/**
 * Create a new sync product
 * @param {Object} productData - Product data
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const createSyncProduct = async (productData) => {
  return await printfulPost('/store/products', productData);
};

/**
 * Update an existing sync product
 * @param {number} syncProductId - Sync product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const updateSyncProduct = async (syncProductId, productData) => {
  return await printfulPut(`/store/products/${syncProductId}`, productData);
};

/**
 * Delete a sync product
 * @param {number} syncProductId - Sync product ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const deleteSyncProduct = async (syncProductId) => {
  return await printfulDelete(`/store/products/${syncProductId}`);
};

/**
 * Get all sync variants for a product
 * @param {number} syncProductId - Sync product ID
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getSyncVariants = async (syncProductId) => {
  return await printfulGet(`/store/products/${syncProductId}/variants`);
};

/**
 * Create or estimate an order
 * @param {Object} orderData - Order data
 * @param {boolean} confirm - Whether to confirm the order (false for estimate)
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const createOrder = async (orderData, confirm = false) => {
  return await printfulPost(`/orders${confirm ? '' : '/estimate-costs'}`, orderData);
};

/**
 * Get order details
 * @param {string} orderId - Order ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getOrder = async (orderId) => {
  return await printfulGet(`/orders/${orderId}`);
};

/**
 * Get all orders
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getOrders = async (options = {}) => {
  let endpoint = '/orders';

  const params = new URLSearchParams();
  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return await printfulGet(endpoint);
};

/**
 * Update order data
 * @param {string} orderId - Order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const updateOrder = async (orderId, orderData) => {
  return await printfulPut(`/orders/${orderId}`, orderData);
};

/**
 * Confirm draft order
 * @param {string} orderId - Order ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const confirmOrder = async (orderId) => {
  return await printfulPost(`/orders/${orderId}/confirm`, {});
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const cancelOrder = async (orderId) => {
  return await printfulDelete(`/orders/${orderId}`);
};

/**
 * Calculate shipping rates
 * @param {Object} shippingData - Shipping data (recipient address, items)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getShippingRates = async (shippingData) => {
  return await printfulPost('/shipping/rates', shippingData);
};

/**
 * Get list of countries for shipping
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getCountries = async () => {
  return await printfulGet('/countries');
};

/**
 * Get tax rate for a specific country/state
 * @param {Object} location - Country and state/region codes
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getTaxRate = async (location) => {
  const params = new URLSearchParams(location);
  return await printfulGet(`/tax/rates?${params.toString()}`);
};

/**
 * Get product mockup images
 * @param {number} productId - Product ID
 * @param {number} variantId - Variant ID
 * @param {Array} files - Array of file objects with placement and URL
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const generateMockup = async (productId, variantId, files) => {
  return await printfulPost('/mockup-generator/create-task', {
    product_id: productId,
    variant_ids: [variantId],
    files: files
  });
};

/**
 * Get mockup generation task result
 * @param {string} taskKey - Task key from generateMockup
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getMockupTask = async (taskKey) => {
  return await printfulGet(`/mockup-generator/task/${taskKey}`);
};

/**
 * Get file information
 * @param {number} fileId - File ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getFile = async (fileId) => {
  return await printfulGet(`/files/${fileId}`);
};

/**
 * Get available print files for a product
 * @param {number} productId - Product ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getPrintFiles = async (productId) => {
  return await printfulGet(`/products/${productId}/printfiles`);
};

/**
 * Get webhook configuration
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getWebhooks = async () => {
  return await printfulGet('/webhooks');
};

/**
 * Set up webhook for order updates
 * @param {string} url - Webhook URL
 * @param {Array} types - Event types to listen for
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const setupWebhook = async (url, types = ['package_shipped', 'package_returned', 'order_failed']) => {
  return await printfulPost('/webhooks', {
    url: url,
    types: types
  });
};

/**
 * Delete webhook
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const deleteWebhook = async () => {
  return await printfulDelete('/webhooks');
};
