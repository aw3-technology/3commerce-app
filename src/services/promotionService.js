import supabase from '../config/supabaseClient';

/**
 * Promotion Service
 * Handles all social media post and promotion-related operations
 */

// ============================================
// SOCIAL POSTS
// ============================================

/**
 * Get all social posts
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of posts to fetch
 * @param {number} options.offset - Pagination offset
 * @param {string} options.status - Filter by status
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getAllPosts = async (options = {}) => {
  const { limit = 50, offset = 0, status } = options;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'User must be authenticated' }
    };
  }

  let query = supabase
    .from('social_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  return { data, error };
};

/**
 * Get a single post by ID
 * @param {string} id - Post ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getPostById = async (id) => {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

/**
 * Create a new social post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {string} postData.image_url - Image URL
 * @param {string} postData.post_type - Post type (picture, video, text)
 * @param {Array<string>} postData.platforms - Social media platforms
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const createPost = async (postData) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('social_posts')
    .insert([
      {
        ...postData,
        user_id: user.id,
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
      },
    ])
    .select()
    .single();

  return { data, error };
};

/**
 * Update a social post
 * @param {string} id - Post ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const updatePost = async (id, updates) => {
  const { data, error } = await supabase
    .from('social_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete a social post
 * @param {string} id - Post ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const deletePost = async (id) => {
  const { data, error } = await supabase
    .from('social_posts')
    .delete()
    .eq('id', id);

  return { data, error };
};

/**
 * Get posts filtered by time period for the current user
 * @param {string} period - Time period ('7days', 'month', 'all')
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getPostsByPeriod = async (period = '7days') => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'User must be authenticated' }
    };
  }

  let query = supabase
    .from('social_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const now = new Date();
  let startDate;

  switch (period) {
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'all':
      // No date filter for 'all'
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;
  return { data: data || [], error };
};

// ============================================
// PROMOTION INSIGHTS
// ============================================

/**
 * Get promotion insights/overview statistics
 * @param {string} period - Time period ('7days', 'month', 'all')
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getPromotionInsights = async (period = '7days') => {
  const now = new Date();
  let startDate;

  switch (period) {
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'all':
      startDate = null;
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  let query = supabase
    .from('social_posts')
    .select('people_reached, engagement_rate, comments_count, link_clicks, views');

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data: posts, error } = await query;

  if (error) {
    return { data: null, error };
  }

  // Calculate aggregated insights
  const insights = {
    peopleReached: posts.reduce((sum, post) => sum + (post.people_reached || 0), 0),
    avgEngagementRate: posts.length > 0
      ? (posts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / posts.length).toFixed(2)
      : 0,
    totalComments: posts.reduce((sum, post) => sum + (post.comments_count || 0), 0),
    totalLinkClicks: posts.reduce((sum, post) => sum + (post.link_clicks || 0), 0),
    totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
    postsCount: posts.length,
  };

  return { data: insights, error: null };
};

/**
 * Get detailed insights with trend data
 * @param {string} period - Time period
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getDetailedInsights = async (period = '7days') => {
  const now = new Date();
  const previousPeriodStart = new Date();
  let currentPeriodStart;

  switch (period) {
    case '7days':
      currentPeriodStart = new Date(now.setDate(now.getDate() - 7));
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
      break;
    case 'month':
      currentPeriodStart = new Date(now.setMonth(now.getMonth() - 1));
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
      break;
    case 'all':
      currentPeriodStart = null;
      break;
    default:
      currentPeriodStart = new Date(now.setDate(now.getDate() - 7));
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
  }

  // Get current period data
  let currentQuery = supabase
    .from('social_posts')
    .select('people_reached, engagement_rate, comments_count, link_clicks, views');

  if (currentPeriodStart) {
    currentQuery = currentQuery.gte('created_at', currentPeriodStart.toISOString());
  }

  const { data: currentPosts, error: currentError } = await currentQuery;

  if (currentError) {
    return { data: null, error: currentError };
  }

  // Get previous period data for comparison
  let previousQuery = supabase
    .from('social_posts')
    .select('people_reached, engagement_rate, comments_count, link_clicks, views')
    .gte('created_at', previousPeriodStart.toISOString())
    .lt('created_at', currentPeriodStart.toISOString());

  const { data: previousPosts } = await previousQuery;

  // Calculate current metrics
  const currentMetrics = {
    peopleReached: currentPosts.reduce((sum, post) => sum + (post.people_reached || 0), 0),
    engagementRate: currentPosts.length > 0
      ? parseFloat((currentPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / currentPosts.length).toFixed(2))
      : 0,
    comments: currentPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0),
    linkClicks: currentPosts.reduce((sum, post) => sum + (post.link_clicks || 0), 0),
    views: currentPosts.reduce((sum, post) => sum + (post.views || 0), 0),
  };

  // Calculate previous metrics for trend
  const previousMetrics = {
    peopleReached: previousPosts?.reduce((sum, post) => sum + (post.people_reached || 0), 0) || 0,
    engagementRate: previousPosts?.length > 0
      ? parseFloat((previousPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / previousPosts.length).toFixed(2))
      : 0,
    comments: previousPosts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0,
    linkClicks: previousPosts?.reduce((sum, post) => sum + (post.link_clicks || 0), 0) || 0,
    views: previousPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0,
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  };

  const insights = {
    peopleReached: {
      value: currentMetrics.peopleReached,
      change: calculateChange(currentMetrics.peopleReached, previousMetrics.peopleReached),
    },
    engagementRate: {
      value: currentMetrics.engagementRate,
      change: calculateChange(currentMetrics.engagementRate, previousMetrics.engagementRate),
    },
    comments: {
      value: currentMetrics.comments,
      change: calculateChange(currentMetrics.comments, previousMetrics.comments),
    },
    linkClicks: {
      value: currentMetrics.linkClicks,
      change: calculateChange(currentMetrics.linkClicks, previousMetrics.linkClicks),
    },
    views: {
      value: currentMetrics.views,
      change: calculateChange(currentMetrics.views, previousMetrics.views),
    },
  };

  return { data: insights, error: null };
};

/**
 * Update post analytics/metrics
 * @param {string} postId - Post ID
 * @param {Object} metrics - Metrics to update
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const updatePostMetrics = async (postId, metrics) => {
  const { data, error } = await supabase
    .from('social_posts')
    .update(metrics)
    .eq('id', postId)
    .select()
    .single();

  return { data, error };
};

/**
 * Get post analytics history
 * @param {string} postId - Post ID
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getPostAnalytics = async (postId) => {
  const { data, error } = await supabase
    .from('social_post_analytics')
    .select('*')
    .eq('post_id', postId)
    .order('date', { ascending: false });

  return { data, error };
};

/**
 * Add daily analytics entry for a post
 * @param {string} postId - Post ID
 * @param {Object} analytics - Daily analytics data
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const addPostAnalytics = async (postId, analytics) => {
  const { data, error } = await supabase
    .from('social_post_analytics')
    .insert([
      {
        post_id: postId,
        ...analytics,
      },
    ])
    .select()
    .single();

  return { data, error };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format number for display (e.g., 256000 -> 256k)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

/**
 * Format engagement rate for display
 * @param {number} rate - Engagement rate
 * @returns {string} Formatted rate
 */
export const formatEngagementRate = (rate) => {
  return rate.toFixed(1) + 'x';
};
