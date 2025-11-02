import supabase from '../config/supabaseClient';

// User/Profile Service - Handles all user profile operations

/**
 * Get current authenticated user
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error };
    }

    // Get user profile data
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', profileError);
      }

      return {
        data: {
          ...user,
          profile: profile || null
        },
        error: null
      };
    }

    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get user profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const upsertUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Updated profile data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Upload user avatar
 * @param {string} userId - User ID
 * @param {File} file - Avatar file
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const uploadAvatar = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    const { data, error } = await updateUserProfile(userId, {
      avatar_url: publicUrl
    });

    return { data: { url: publicUrl, ...data }, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Remove user avatar
 * @param {string} userId - User ID
 * @param {string} avatarUrl - Current avatar URL to delete
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const removeAvatar = async (userId, avatarUrl) => {
  try {
    // Extract file path from URL if it's a Supabase storage URL
    if (avatarUrl && avatarUrl.includes('/storage/v1/object/public/')) {
      const filePath = avatarUrl.split('/storage/v1/object/public/avatars/')[1];
      if (filePath) {
        await supabase.storage.from('avatars').remove([`avatars/${filePath}`]);
      }
    }

    // Update profile to remove avatar URL
    const { data, error } = await updateUserProfile(userId, {
      avatar_url: null
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user email in auth system
 * @param {string} newEmail - New email address
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateUserEmail = async (newEmail) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Sign out user
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
