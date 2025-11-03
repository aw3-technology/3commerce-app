import supabase from '../config/supabaseClient';

// Comments Service - Handles product comments and reviews

/**
 * Get all comments with filtering, search, and pagination
 * @param {Object} options - Query options
 * @param {string} options.productId - Filter by product ID
 * @param {string} options.search - Search by product name or comment content
 * @param {string} options.status - Filter by status (pending, approved, rejected)
 * @param {number} options.limit - Limit results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllComments = async (options = {}) => {
  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        products (
          id,
          name,
          image_url,
          category
        ),
        customers (
          id,
          name,
          email,
          avatar_url
        )
      `);

    if (options.productId) {
      query = query.eq('product_id', options.productId);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    // Search by product name or comment content
    if (options.search) {
      // Note: This is a basic search. For better performance, consider using full-text search
      query = query.or(`content.ilike.%${options.search}%,products.name.ilike.%${options.search}%`);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get comment count
 * @param {Object} options - Query options
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCommentCount = async (options = {}) => {
  try {
    let query = supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.search) {
      query = query.or(`content.ilike.%${options.search}%,products.name.ilike.%${options.search}%`);
    }

    const { count, error } = await query;

    return { data: { count }, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create a new comment
 * @param {Object} commentData - Comment data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createComment = async (commentData) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          ...commentData,
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
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} updates - Updated data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateComment = async (commentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const deleteComment = async (commentId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Approve/reject a comment
 * @param {string} commentId - Comment ID
 * @param {string} status - New status (approved, rejected)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const moderateComment = async (commentId, status) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
