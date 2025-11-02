import supabase from '../config/supabaseClient';

// Authentication Service - Handles user authentication and session management

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - Additional user metadata
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      }
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error: Object}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Get the current user session
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get the current user
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { data: user, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateProfile = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update password
 * @param {string} newPassword - New password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} Subscription object
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
