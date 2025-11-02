import supabase from '../config/supabaseClient';

/**
 * Get all notifications for the current user
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results to return
 * @param {number} options.offset - Number of results to skip
 * @param {string} options.type - Filter by notification type (order, product, customer, system)
 * @param {boolean} options.unreadOnly - Only return unread notifications
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const getAllNotifications = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, type = null, unreadOnly = false } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by type if provided
    if (type) {
      query = query.eq('type', type);
    }

    // Filter unread only if requested
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
};

/**
 * Get a single notification by ID
 * @param {string} id - Notification ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const getNotificationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching notification:', error);
    return { data: null, error };
  }
};

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (order, product, customer, system)
 * @param {string} notificationData.link - Optional link URL
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const createNotification = async (notificationData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notificationData,
        user_id: user.id,
        read: false
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
};

/**
 * Mark a notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const markAsRead = async (id) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { data: null, error };
  }
};

/**
 * Mark multiple notifications as read
 * @param {Array<string>} ids - Array of notification IDs
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const markMultipleAsRead = async (ids) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return { data: null, error };
  }
};

/**
 * Mark all notifications as read for the current user
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const markAllAsRead = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { data: null, error };
  }
};

/**
 * Delete a notification
 * @param {string} id - Notification ID
 * @returns {Promise<{data: Object, error: Error}>}
 */
export const deleteNotification = async (id) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { data: null, error };
  }
};

/**
 * Delete multiple notifications
 * @param {Array<string>} ids - Array of notification IDs
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const deleteMultipleNotifications = async (ids) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .in('id', ids)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return { data: null, error };
  }
};

/**
 * Delete all notifications for the current user
 * @returns {Promise<{data: Array, error: Error}>}
 */
export const deleteAllNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return { data: null, error };
  }
};

/**
 * Get notification count
 * @param {Object} options - Query options
 * @param {boolean} options.unreadOnly - Only count unread notifications
 * @returns {Promise<{data: number, error: Error}>}
 */
export const getNotificationCount = async (options = {}) => {
  try {
    const { unreadOnly = false } = options;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { count, error } = await query;

    if (error) throw error;

    return { data: count, error: null };
  } catch (error) {
    console.error('Error getting notification count:', error);
    return { data: null, error };
  }
};

/**
 * Subscribe to real-time notification updates
 * @param {Function} callback - Callback function to handle notification updates
 * @returns {Object} Subscription object
 */
export const subscribeToNotifications = (callback) => {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications'
    }, callback)
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from notification updates
 * @param {Object} subscription - Subscription object to unsubscribe
 */
export const unsubscribeFromNotifications = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};
