import supabase from '../config/supabaseClient';

// Customers Service - Handles all customer-related database operations

/**
 * Fetch all customers
 * @param {Object} options - Query options (limit, offset, filters)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAllCustomers = async (options = {}) => {
  try {
    let query = supabase.from('customers').select('*');

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
 * Fetch a single customer by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCustomerById = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createCustomer = async (customerData) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          ...customerData,
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
 * Update an existing customer
 * @param {string} customerId - Customer ID
 * @param {Object} updates - Updated customer data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateCustomer = async (customerId, updates) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const deleteCustomer = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer statistics
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCustomerStats = async () => {
  try {
    const { count: totalCount, error: totalError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get active customers (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeCount, error: activeError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    if (totalError || activeError) {
      return {
        data: null,
        error: totalError || activeError
      };
    }

    return {
      data: {
        total: totalCount,
        active: activeCount,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Search customers by name or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const searchCustomers = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer purchase history
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomerPurchases = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer growth data over time
 * @param {number} days - Number of days to look back (default 30)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomerGrowthData = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Group by date
    const groupedData = data.reduce((acc, customer) => {
      const date = new Date(customer.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    // Convert to array format for charts
    const chartData = Object.keys(groupedData).map(date => ({
      date,
      count: groupedData[date]
    }));

    return { data: chartData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get active customers data over time
 * @param {number} days - Number of days to look back (default 30)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getActiveCustomersData = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get customers with login activity
    const { data, error } = await supabase
      .from('customers')
      .select('last_login, created_at')
      .gte('last_login', startDate.toISOString())
      .order('last_login', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Group by date and categorize by recency
    const dailyData = {};

    data.forEach(customer => {
      const loginDate = new Date(customer.last_login);
      const createdDate = new Date(customer.created_at);
      const dateKey = loginDate.toISOString().split('T')[0];

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { daily: 0, weekly: 0, monthly: 0 };
      }

      const daysSinceCreation = Math.floor((loginDate - createdDate) / (1000 * 60 * 60 * 24));

      if (daysSinceCreation <= 1) {
        dailyData[dateKey].daily++;
      } else if (daysSinceCreation <= 7) {
        dailyData[dateKey].weekly++;
      } else {
        dailyData[dateKey].monthly++;
      }
    });

    // Convert to array format for charts
    const chartData = Object.keys(dailyData).map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      daily: dailyData[date].daily,
      weekly: dailyData[date].weekly,
      monthly: dailyData[date].monthly,
    }));

    return { data: chartData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get new vs returning customer statistics
 * @param {number} days - Number of days to consider as "new" (default 30)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getNewVsReturningCustomers = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get new customers (created within the period)
    const { count: newCount, error: newError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString());

    // Get returning customers (created before the period but logged in recently)
    const { count: returningCount, error: returningError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate.toISOString())
      .gte('last_login', cutoffDate.toISOString());

    if (newError || returningError) {
      return {
        data: null,
        error: newError || returningError
      };
    }

    return {
      data: {
        newCustomers: newCount || 0,
        returningCustomers: returningCount || 0,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer distribution by country
 * @param {number} limit - Number of top countries to return (default 10)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomersByCountry = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('country');

    if (error) {
      return { data: null, error };
    }

    // Count customers by country
    const countryCount = data.reduce((acc, customer) => {
      const country = customer.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = 0;
      }
      acc[country]++;
      return acc;
    }, {});

    // Convert to array and sort by count
    const sortedCountries = Object.keys(countryCount)
      .map(country => ({
        name: country,
        views: countryCount[country]
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return { data: sortedCountries, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get total customers with growth percentage
 * @param {number} days - Number of days to compare (default 28)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCustomerGrowthStats = async (days = 28) => {
  try {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    const previousPastDate = new Date();
    previousPastDate.setDate(previousPastDate.getDate() - (days * 2));

    // Get total customers
    const { count: totalCount, error: totalError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get current period customers
    const { count: currentPeriod, error: currentError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', pastDate.toISOString());

    // Get previous period customers
    const { count: previousPeriod, error: previousError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousPastDate.toISOString())
      .lt('created_at', pastDate.toISOString());

    if (totalError || currentError || previousError) {
      return {
        data: null,
        error: totalError || currentError || previousError
      };
    }

    // Calculate growth percentage
    const growthPercentage = previousPeriod > 0
      ? (((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1)
      : 100;

    return {
      data: {
        total: totalCount || 0,
        currentPeriod: currentPeriod || 0,
        previousPeriod: previousPeriod || 0,
        growthPercentage: parseFloat(growthPercentage),
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customers with engagement metrics (for customer list)
 * @param {Object} options - Query options (limit, offset, status, search)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomersWithEngagement = async (options = {}) => {
  try {
    let query = supabase
      .from('customers')
      .select('*');

    // Filter by status (active, new, inactive)
    if (options.status === 'active') {
      // Active customers: those who logged in within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('last_login', thirtyDaysAgo.toISOString());
    } else if (options.status === 'new') {
      // New customers: created within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('created_at', thirtyDaysAgo.toISOString());
    }

    // Search by name or email
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Sort by created_at (newest first) or by other fields
    if (options.sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else if (options.sortBy === 'purchases') {
      query = query.order('order_count', { ascending: false });
    } else if (options.sortBy === 'lifetime') {
      query = query.order('total_spent', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: customers, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Enrich customer data with engagement metrics
    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        // Get comment count
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id);

        // Get like count
        const { count: likeCount } = await supabase
          .from('customer_likes')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id);

        // Generate username from email if not exists
        const username = customer.email ? `@${customer.email.split('@')[0]}` : '@user';

        return {
          ...customer,
          username,
          comment_count: commentCount || 0,
          like_count: likeCount || 0,
        };
      })
    );

    return { data: enrichedCustomers, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer count by status
 * @param {string} status - Status filter (active, new, inactive)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCustomerCountByStatus = async (status = null) => {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (status === 'active') {
      // Active customers: those who logged in within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('last_login', thirtyDaysAgo.toISOString());
    } else if (status === 'new') {
      // New customers: created within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('created_at', thirtyDaysAgo.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data: { count }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Like a product (customer action)
 * @param {string} customerId - Customer ID
 * @param {string} productId - Product ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const likeProduct = async (customerId, productId) => {
  try {
    const { data, error } = await supabase
      .from('customer_likes')
      .insert([
        {
          customer_id: customerId,
          product_id: productId,
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
 * Unlike a product (customer action)
 * @param {string} customerId - Customer ID
 * @param {string} productId - Product ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const unlikeProduct = async (customerId, productId) => {
  try {
    const { data, error } = await supabase
      .from('customer_likes')
      .delete()
      .eq('customer_id', customerId)
      .eq('product_id', productId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get products liked by customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomerLikes = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('customer_likes')
      .select(`
        *,
        products (
          id,
          name,
          description,
          image_url,
          price
        )
      `)
      .eq('customer_id', customerId);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
