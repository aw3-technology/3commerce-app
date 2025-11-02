import supabase from '../config/supabaseClient';

// Creators Service - Handles all creator-related database operations

/**
 * Fetch all creators with optional filters
 * @param {Object} options - Query options (limit, offset, sort)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllCreators = async (options = {}) => {
  try {
    let query = supabase
      .from('creators')
      .select(`
        *,
        products:products!creator_id (
          id,
          name,
          image_url,
          price,
          status
        )
      `);

    // Apply sorting
    if (options.sortBy === 'followers') {
      query = query.order('followers', { ascending: false });
    } else if (options.sortBy === 'sales') {
      query = query.order('total_sales', { ascending: false });
    } else if (options.sortBy === 'trending') {
      query = query.order('trending_score', { ascending: false });
    } else if (options.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('followers', { ascending: false });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get popular creators (sorted by followers)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getPopularCreators = async (options = {}) => {
  return getAllCreators({ ...options, sortBy: 'followers' });
};

/**
 * Get trending creators (sorted by trending score)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getTrendingCreators = async (options = {}) => {
  return getAllCreators({ ...options, sortBy: 'trending' });
};

/**
 * Get best selling creators (sorted by total sales)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getBestSellingCreators = async (options = {}) => {
  return getAllCreators({ ...options, sortBy: 'sales' });
};

/**
 * Get newest creators (sorted by creation date)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getNewestCreators = async (options = {}) => {
  return getAllCreators({ ...options, sortBy: 'newest' });
};

/**
 * Get a single creator by ID with their products
 * @param {string} creatorId - Creator ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCreatorById = async (creatorId) => {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select(`
        *,
        products:products!creator_id (
          id,
          name,
          description,
          image_url,
          price,
          status,
          sales_count,
          created_at
        )
      `)
      .eq('id', creatorId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get total count of creators
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCreatorCount = async () => {
  try {
    const { count, error } = await supabase
      .from('creators')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { data: null, error };
    }

    return { data: { count }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Follow a creator
 * @param {string} creatorId - Creator ID
 * @param {string} userId - User ID (optional, will use authenticated user if not provided)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const followCreator = async (creatorId, userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('creator_follows')
      .insert([
        {
          creator_id: creatorId,
          user_id: userId,
        }
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Unfollow a creator
 * @param {string} creatorId - Creator ID
 * @param {string} userId - User ID (optional, will use authenticated user if not provided)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const unfollowCreator = async (creatorId, userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('creator_follows')
      .delete()
      .eq('creator_id', creatorId)
      .eq('user_id', userId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if user is following a creator
 * @param {string} creatorId - Creator ID
 * @param {string} userId - User ID (optional, will use authenticated user if not provided)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const isFollowingCreator = async (creatorId, userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: { isFollowing: false }, error: null };
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('creator_follows')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('user_id', userId)
      .single();

    return {
      data: { isFollowing: !!data },
      error: null
    };
  } catch (error) {
    return { data: { isFollowing: false }, error: null };
  }
};

/**
 * Get creators followed by a user
 * @param {string} userId - User ID (optional, will use authenticated user if not provided)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getFollowedCreators = async (userId = null) => {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], error: null };
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('creator_follows')
      .select(`
        creator_id,
        creators:creators (
          *,
          products:products!creator_id (
            id,
            name,
            image_url,
            price
          )
        )
      `)
      .eq('user_id', userId);

    // Transform data to return just creators
    const creators = data ? data.map(item => item.creators).filter(Boolean) : [];

    return { data: creators, error };
  } catch (error) {
    return { data: [], error };
  }
};

/**
 * Create a new creator profile
 * @param {Object} creatorData - Creator data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createCreator = async (creatorData) => {
  try {
    const { data, error } = await supabase
      .from('creators')
      .insert([
        {
          ...creatorData,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update a creator profile
 * @param {string} creatorId - Creator ID
 * @param {Object} updates - Updated creator data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateCreator = async (creatorId, updates) => {
  try {
    const { data, error } = await supabase
      .from('creators')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a creator profile
 * @param {string} creatorId - Creator ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const deleteCreator = async (creatorId) => {
  try {
    const { data, error } = await supabase
      .from('creators')
      .delete()
      .eq('id', creatorId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Search creators by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const searchCreators = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select(`
        *,
        products:products!creator_id (
          id,
          name,
          image_url,
          price
        )
      `)
      .ilike('name', `%${searchTerm}%`)
      .order('followers', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
