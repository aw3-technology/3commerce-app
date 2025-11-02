import supabase from '../config/supabaseClient';

// Comments Service - Handles product comments and reviews

/**
 * Get all comments
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllComments = async (options = {}) => {
  try {
    let query = supabase
      .from('comments')
      .select('*, products(*), customers(*)');

    if (options.productId) {
      query = query.eq('product_id', options.productId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
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
