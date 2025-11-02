import supabase from '../config/supabaseClient';

// Help & Getting Started Service - Handles FAQs, help resources, and support tickets

/**
 * Get all FAQ categories
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getFaqCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    return { data: null, error };
  }
};

/**
 * Get FAQ items by category
 * @param {string} categoryId - Category UUID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getFaqItemsByCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    return { data: null, error };
  }
};

/**
 * Get all FAQs grouped by category
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllFaqs = async () => {
  try {
    const { data, error } = await supabase
      .from('faq_categories')
      .select(`
        id,
        title,
        description,
        display_order,
        faq_items (
          id,
          question,
          answer,
          display_order,
          view_count,
          helpful_count,
          not_helpful_count
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Transform data to match expected format
    const transformedData = data?.map(category => ({
      title: category.title,
      description: category.description,
      items: category.faq_items
        ?.filter(item => item !== null)
        .sort((a, b) => a.display_order - b.display_order)
        .map(item => ({
          id: item.id,
          title: item.question,
          content: item.answer,
          viewCount: item.view_count,
          helpfulCount: item.helpful_count,
          notHelpfulCount: item.not_helpful_count,
        })) || []
    })) || [];

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching all FAQs:', error);
    return { data: null, error };
  }
};

/**
 * Search FAQs
 * @param {string} searchTerm - Search query
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const searchFaqs = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select(`
        id,
        question,
        answer,
        category_id,
        faq_categories (title)
      `)
      .eq('is_active', true)
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching FAQs:', error);
    return { data: null, error };
  }
};

/**
 * Increment FAQ view count
 * @param {string} faqId - FAQ item UUID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const incrementFaqViewCount = async (faqId) => {
  try {
    const { data, error } = await supabase.rpc('increment_faq_view_count', {
      faq_id: faqId
    });

    // If RPC function doesn't exist, use direct update
    if (error && error.code === '42883') {
      const { data: current } = await supabase
        .from('faq_items')
        .select('view_count')
        .eq('id', faqId)
        .single();

      const { data: updated, error: updateError } = await supabase
        .from('faq_items')
        .update({ view_count: (current?.view_count || 0) + 1 })
        .eq('id', faqId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updated, error: null };
    }

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error incrementing FAQ view count:', error);
    return { data: null, error };
  }
};

/**
 * Mark FAQ as helpful
 * @param {string} faqId - FAQ item UUID
 * @param {boolean} isHelpful - true for helpful, false for not helpful
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const markFaqHelpful = async (faqId, isHelpful = true) => {
  try {
    const field = isHelpful ? 'helpful_count' : 'not_helpful_count';

    const { data: current } = await supabase
      .from('faq_items')
      .select(field)
      .eq('id', faqId)
      .single();

    const { data, error } = await supabase
      .from('faq_items')
      .update({ [field]: (current?.[field] || 0) + 1 })
      .eq('id', faqId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking FAQ helpful:', error);
    return { data: null, error };
  }
};

/**
 * Get all help resources
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getHelpResources = async (options = {}) => {
  try {
    let query = supabase
      .from('help_resources')
      .select(`
        *,
        author:author_id(id, email, raw_user_meta_data)
      `)
      .order('display_order', { ascending: true });

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.featured) {
      query = query.eq('is_featured', true);
    }

    if (options.isNew) {
      query = query.eq('is_new', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching help resources:', error);
    return { data: null, error };
  }
};

/**
 * Get help resource by ID
 * @param {string} resourceId - Resource UUID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getHelpResourceById = async (resourceId) => {
  try {
    const { data, error } = await supabase
      .from('help_resources')
      .select(`
        *,
        author:author_id(id, email, raw_user_meta_data)
      `)
      .eq('id', resourceId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching help resource:', error);
    return { data: null, error };
  }
};

/**
 * Increment help resource view count
 * @param {string} resourceId - Resource UUID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const incrementResourceViewCount = async (resourceId) => {
  try {
    const { data: current } = await supabase
      .from('help_resources')
      .select('view_count')
      .eq('id', resourceId)
      .single();

    const { data, error } = await supabase
      .from('help_resources')
      .update({ view_count: (current?.view_count || 0) + 1 })
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error incrementing resource view count:', error);
    return { data: null, error };
  }
};

/**
 * Track user help activity
 * @param {string} userId - User UUID
 * @param {string} resourceType - Type of resource (faq, help_resource, tutorial)
 * @param {string} resourceId - Resource UUID
 * @param {string} action - Action performed (viewed, completed, helpful, not_helpful)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const trackHelpActivity = async (userId, resourceType, resourceId, action) => {
  try {
    const { data, error } = await supabase
      .from('user_help_activity')
      .insert([
        {
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          action: action,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error tracking help activity:', error);
    return { data: null, error };
  }
};

/**
 * Get user help activity
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getUserHelpActivity = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('user_help_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.resourceType) {
      query = query.eq('resource_type', options.resourceType);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user help activity:', error);
    return { data: null, error };
  }
};

/**
 * Create support ticket
 * @param {Object} ticketData - Ticket information
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createSupportTicket = async (ticketData) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_id: ticketData.user_id,
          subject: ticketData.subject,
          description: ticketData.description,
          category: ticketData.category || 'other',
          priority: ticketData.priority || 'normal',
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return { data: null, error };
  }
};

/**
 * Get user's support tickets
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getUserSupportTickets = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return { data: null, error };
  }
};

/**
 * Get support ticket by ID
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getSupportTicketById = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_replies (
          *,
          user:user_id(id, email, raw_user_meta_data)
        )
      `)
      .eq('id', ticketId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return { data: null, error };
  }
};

/**
 * Reply to support ticket
 * @param {string} ticketId - Ticket UUID
 * @param {string} userId - User UUID
 * @param {string} message - Reply message
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const replyToSupportTicket = async (ticketId, userId, message) => {
  try {
    const { data, error } = await supabase
      .from('support_ticket_replies')
      .insert([
        {
          ticket_id: ticketId,
          user_id: userId,
          message: message,
          is_staff_reply: false,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update ticket's updated_at timestamp
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return { data, error: null };
  } catch (error) {
    console.error('Error replying to support ticket:', error);
    return { data: null, error };
  }
};

/**
 * Update support ticket status
 * @param {string} ticketId - Ticket UUID
 * @param {string} status - New status
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateSupportTicketStatus = async (ticketId, status) => {
  try {
    const updateData = { status };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating support ticket status:', error);
    return { data: null, error };
  }
};

/**
 * Subscribe to support ticket updates (real-time)
 * @param {string} ticketId - Ticket UUID
 * @param {Function} callback - Callback function when ticket is updated
 * @returns {Object} Subscription object
 */
export const subscribeToTicketUpdates = (ticketId, callback) => {
  const subscription = supabase
    .channel(`ticket_${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'support_ticket_replies',
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from ticket updates
 * @param {Object} subscription - Subscription object
 */
export const unsubscribeFromTicketUpdates = async (subscription) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
};
