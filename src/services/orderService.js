import supabase from '../config/supabaseClient';

// Orders & Transactions Service - Handles all order-related database operations

/**
 * Fetch all orders
 * @param {Object} options - Query options (limit, offset, filters)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllOrders = async (options = {}) => {
  try {
    let query = supabase
      .from('orders')
      .select('*, customers(*), products(*)');

    if (options.status) {
      query = query.eq('status', options.status);
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
 * Fetch a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(*), products(*)')
      .eq('id', orderId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createOrder = async (orderData) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          ...orderData,
          created_at: new Date().toISOString(),
          status: orderData.status || 'pending',
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
 * Update an existing order
 * @param {string} orderId - Order ID
 * @param {Object} updates - Updated order data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateOrder = async (orderId, updates) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get order statistics
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getOrderStats = async () => {
  try {
    // Total orders
    const { count: totalCount, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Completed orders
    const { count: completedCount, error: completedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Pending orders
    const { count: pendingCount, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    if (totalError || completedError || pendingError || revenueError) {
      return {
        data: null,
        error: totalError || completedError || pendingError || revenueError
      };
    }

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return {
      data: {
        total: totalCount,
        completed: completedCount,
        pending: pendingCount,
        revenue: totalRevenue,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get transactions/payments
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getTransactions = async (options = {}) => {
  try {
    let query = supabase
      .from('transactions')
      .select('*, orders(*), customers(*)');

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
 * Get earnings over time
 * @param {string} period - Time period (day, week, month, year)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getEarnings = async (period = 'month') => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get refund requests with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (pending, approved, rejected, processed)
 * @param {number} options.limit - Limit results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getRefunds = async (options = {}) => {
  try {
    let query = supabase
      .from('refunds')
      .select(`
        *,
        orders (
          id,
          total_amount,
          created_at,
          product_id,
          products (
            id,
            name,
            image_url,
            category
          )
        ),
        customers (
          id,
          name,
          email,
          avatar_url
        )
      `);

    // Filter by status if provided
    // "Open requests" = pending status
    // "Closed requests" = approved, rejected, or processed status
    if (options.statusFilter === 'open') {
      query = query.eq('status', 'pending');
    } else if (options.statusFilter === 'closed') {
      query = query.in('status', ['approved', 'rejected', 'processed']);
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
 * Get refund by ID
 * @param {string} refundId - Refund ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getRefundById = async (refundId) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select(`
        *,
        orders (
          id,
          total_amount,
          created_at,
          product_id,
          products (
            id,
            name,
            image_url,
            category
          )
        ),
        customers (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('id', refundId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Process a refund (approve or decline)
 * @param {string} refundId - Refund ID
 * @param {string} status - New status (approved, rejected, processed)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const processRefund = async (refundId, status) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .update({
        status,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get refund count by status
 * @param {string} statusFilter - 'open' or 'closed'
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getRefundCount = async (statusFilter = null) => {
  try {
    let query = supabase
      .from('refunds')
      .select('*', { count: 'exact', head: true });

    if (statusFilter === 'open') {
      query = query.eq('status', 'pending');
    } else if (statusFilter === 'closed') {
      query = query.in('status', ['approved', 'rejected', 'processed']);
    }

    const { count, error } = await query;

    return { data: { count }, error };
  } catch (error) {
    return { data: null, error };
  }
};
