import { unsplashGet, triggerDownload } from './unsplashClient';

// Unsplash Service - Handles all Unsplash API operations

/**
 * Search photos by query
 * @param {string} query - Search query
 * @param {Object} options - Query options (page, per_page, orientation, color)
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const searchPhotos = async (query, options = {}) => {
  const params = {
    query: query,
    page: options.page || 1,
    per_page: options.per_page || 30,
    ...options
  };

  return await unsplashGet('/search/photos', params);
};

/**
 * Get a list of curated photos
 * @param {Object} options - Query options (page, per_page, order_by)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getPhotos = async (options = {}) => {
  const params = {
    page: options.page || 1,
    per_page: options.per_page || 30,
    order_by: options.order_by || 'latest' // latest, oldest, popular
  };

  return await unsplashGet('/photos', params);
};

/**
 * Get a specific photo by ID
 * @param {string} photoId - Photo ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getPhoto = async (photoId) => {
  return await unsplashGet(`/photos/${photoId}`);
};

/**
 * Get random photos
 * @param {Object} options - Query options (count, query, orientation, collections)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getRandomPhotos = async (options = {}) => {
  const params = {
    count: options.count || 10,
    ...options
  };

  return await unsplashGet('/photos/random', params);
};

/**
 * Get photo collections
 * @param {Object} options - Query options (page, per_page)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getCollections = async (options = {}) => {
  const params = {
    page: options.page || 1,
    per_page: options.per_page || 30
  };

  return await unsplashGet('/collections', params);
};

/**
 * Get photos from a specific collection
 * @param {string} collectionId - Collection ID
 * @param {Object} options - Query options (page, per_page, orientation)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getCollectionPhotos = async (collectionId, options = {}) => {
  const params = {
    page: options.page || 1,
    per_page: options.per_page || 30,
    ...options
  };

  return await unsplashGet(`/collections/${collectionId}/photos`, params);
};

/**
 * Search collections
 * @param {string} query - Search query
 * @param {Object} options - Query options (page, per_page)
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const searchCollections = async (query, options = {}) => {
  const params = {
    query: query,
    page: options.page || 1,
    per_page: options.per_page || 30
  };

  return await unsplashGet('/search/collections', params);
};

/**
 * Get topics
 * @param {Object} options - Query options (page, per_page, order_by)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getTopics = async (options = {}) => {
  const params = {
    page: options.page || 1,
    per_page: options.per_page || 30,
    order_by: options.order_by || 'featured' // featured, latest, oldest, position
  };

  return await unsplashGet('/topics', params);
};

/**
 * Get photos from a specific topic
 * @param {string} topicIdOrSlug - Topic ID or slug
 * @param {Object} options - Query options (page, per_page, orientation)
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getTopicPhotos = async (topicIdOrSlug, options = {}) => {
  const params = {
    page: options.page || 1,
    per_page: options.per_page || 30,
    ...options
  };

  return await unsplashGet(`/topics/${topicIdOrSlug}/photos`, params);
};

/**
 * Track photo download (required by Unsplash API guidelines)
 * IMPORTANT: Must be called when user uses an image
 * @param {string} downloadLocation - Download location URL from photo object
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const trackPhotoDownload = async (downloadLocation) => {
  return await triggerDownload(downloadLocation);
};

/**
 * Helper function to get the appropriate image URL based on size
 * @param {Object} photo - Photo object from Unsplash
 * @param {string} size - Size ('raw', 'full', 'regular', 'small', 'thumb')
 * @returns {string} Image URL
 */
export const getPhotoUrl = (photo, size = 'regular') => {
  return photo.urls?.[size] || photo.urls?.regular;
};

/**
 * Helper function to format photo attribution
 * @param {Object} photo - Photo object from Unsplash
 * @returns {Object} Attribution info
 */
export const getPhotoAttribution = (photo) => {
  return {
    photographerName: photo.user?.name || 'Unknown',
    photographerUsername: photo.user?.username,
    photographerUrl: photo.user?.links?.html,
    unsplashUrl: photo.links?.html,
    attributionText: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`
  };
};

/**
 * Popular search categories for easy browsing
 */
export const POPULAR_CATEGORIES = [
  'business',
  'technology',
  'food',
  'nature',
  'fashion',
  'travel',
  'architecture',
  'animals',
  'people',
  'sports',
  'abstract',
  'texture',
  'wallpapers',
  'minimalism',
  'wellness'
];

/**
 * Orientation options for filtering
 */
export const ORIENTATIONS = {
  ALL: null,
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
  SQUARISH: 'squarish'
};

/**
 * Color options for filtering
 */
export const COLORS = {
  ALL: null,
  BLACK_AND_WHITE: 'black_and_white',
  BLACK: 'black',
  WHITE: 'white',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  RED: 'red',
  PURPLE: 'purple',
  MAGENTA: 'magenta',
  GREEN: 'green',
  TEAL: 'teal',
  BLUE: 'blue'
};
