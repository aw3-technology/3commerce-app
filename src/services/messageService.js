import supabase from '../config/supabaseClient';

// Message Service - Handles all message-related database operations

/**
 * Fetch all conversations (users with messages)
 * Groups messages by conversation partner and returns the latest message
 * @param {string} userId - Current user ID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getConversations = async (userId) => {
  try {
    // Simply get messages without trying to join with auth.users
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation partner
    const conversations = {};
    data?.forEach((message) => {
      const partnerId = message.sender_id === userId
        ? message.recipient_id
        : message.sender_id;

      if (!conversations[partnerId] ||
          new Date(message.created_at) > new Date(conversations[partnerId].created_at)) {
        conversations[partnerId] = {
          ...message,
          partnerId: partnerId,
          unread: !message.read && message.recipient_id === userId,
        };
      }
    });

    return { data: Object.values(conversations), error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: [], error };
  }
};

/**
 * Fetch all messages in a conversation
 * @param {string} userId - Current user ID
 * @param {string} partnerId - Conversation partner ID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getConversationMessages = async (userId, partnerId) => {
  try {
    // Get messages without trying to join with auth.users
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return { data: [], error };
  }
};

/**
 * Send a new message
 * @param {Object} messageData - Message data (sender_id, recipient_id, content, subject, customer_id)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const sendMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: messageData.sender_id,
          recipient_id: messageData.recipient_id,
          content: messageData.content,
          subject: messageData.subject || null,
          customer_id: messageData.customer_id || null,
          read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

/**
 * Mark a message as read
 * @param {string} messageId - Message ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const markAsRead = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { data: null, error };
  }
};

/**
 * Mark all messages in a conversation as read
 * @param {string} userId - Current user ID (recipient)
 * @param {string} partnerId - Conversation partner ID (sender)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const markConversationAsRead = async (userId, partnerId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('sender_id', partnerId)
      .eq('read', false)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { data: null, error };
  }
};

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const deleteMessage = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { data: null, error };
  }
};

/**
 * Search messages by content
 * @param {string} userId - Current user ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const searchMessages = async (userId, searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .ilike('content', `%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching messages:', error);
    return { data: [], error };
  }
};

/**
 * Get unread message count
 * @param {string} userId - Current user ID
 * @returns {Promise<{data: number, error: Object}>}
 */
export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { data: count, error: null };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { data: 0, error };
  }
};

/**
 * Subscribe to new messages (real-time)
 * @param {string} userId - Current user ID
 * @param {Function} callback - Callback function when new message arrives
 * @returns {Object} Subscription object
 */
export const subscribeToMessages = (userId, callback) => {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time messages
 * @param {Object} subscription - Subscription object
 */
export const unsubscribeFromMessages = async (subscription) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
};
