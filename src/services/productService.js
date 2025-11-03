import supabase from '../config/supabaseClient';

// Products Service - Handles all product-related database operations

/**
 * Fetch all products for the current user
 * @param {Object} options - Query options (limit, offset, filters)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllProducts = async (options = {}) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: { message: 'User must be authenticated' }
      };
    }

    let query = supabase.from('products').select('*').eq('user_id', user.id);

    // Apply filters if provided
    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Fetch a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createProduct = async (productData) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: { message: 'User must be authenticated to create products' }
      };
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          ...productData,
          user_id: user.id,
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
 * Update an existing product
 * @param {string} productId - Product ID
 * @param {Object} updates - Updated product data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a product
 * @param {string} productId - Product ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const deleteProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get products by status (draft, published, scheduled)
 * @param {string} status - Product status
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getProductsByStatus = async (status) => {
  return getAllProducts({ status });
};

/**
 * Get product statistics for the current user
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getProductStats = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: { message: 'User must be authenticated' }
      };
    }

    const { count: totalCount, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: publishedCount, error: publishedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published');

    const { count: draftCount, error: draftError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'draft');

    if (totalError || publishedError || draftError) {
      return {
        data: null,
        error: totalError || publishedError || draftError
      };
    }

    return {
      data: {
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Search products by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get popular products based on sales count (for current user)
 * @param {Object} options - Query options (limit, userId)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getPopularProducts = async (options = {}) => {
  try {
    const limit = options.limit || 8;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: null };
    }

    // Get products with sales data for current user
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('sales_count', { ascending: false })
      .limit(limit);

    if (productsError) {
      return { data: null, error: productsError };
    }

    // For each product, calculate total earnings
    const productsWithEarnings = await Promise.all(
      productsData.map(async (product) => {
        // Get completed orders for this product
        const { data: orderItems, error: orderError } = await supabase
          .from('order_items')
          .select('quantity, price, orders!inner(status)')
          .eq('product_id', product.id)
          .eq('orders.status', 'completed');

        if (orderError) {
          console.error('Error fetching order items:', orderError);
          return {
            ...product,
            total_earnings: 0,
            sales_count: 0
          };
        }

        // Calculate total earnings for this product
        const totalEarnings = orderItems?.reduce((sum, item) => {
          return sum + (item.quantity * item.price);
        }, 0) || 0;

        const salesCount = orderItems?.reduce((sum, item) => {
          return sum + item.quantity;
        }, 0) || 0;

        return {
          ...product,
          total_earnings: totalEarnings,
          sales_count: salesCount
        };
      })
    );

    // Sort by total earnings (most popular = highest earnings)
    const sortedProducts = productsWithEarnings.sort((a, b) => {
      return (b.total_earnings || 0) - (a.total_earnings || 0);
    });

    return { data: sortedProducts, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
