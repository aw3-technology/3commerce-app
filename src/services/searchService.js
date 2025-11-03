import supabase from '../config/supabaseClient';

// Search Service - Unified search across all entities

/**
 * Global search across products, customers, and orders
 * @param {string} query - Search query
 * @param {Object} options - Search options (limit, types)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const globalSearch = async (query, options = {}) => {
  try {
    const { limit = 10, types = ['products', 'customers', 'orders'] } = options;
    const results = {
      products: [],
      customers: [],
      orders: [],
      total: 0,
    };

    // Search products
    if (types.includes('products')) {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (!productsError && productsData) {
        results.products = productsData.map(product => ({
          id: product.id,
          type: 'product',
          title: product.name,
          content: product.category || 'Product',
          image: product.image_url || '/images/content/product-pic-1.jpg',
          image2x: product.image_url || '/images/content/product-pic-1@2x.jpg',
          price: product.price,
          status: product.status,
          url: `/products/${product.id}`,
          metadata: {
            category: product.category,
            price: product.price,
            status: product.status,
          },
        }));
        results.total += productsData.length;
      }
    }

    // Search customers
    if (types.includes('customers')) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (!customersError && customersData) {
        results.customers = customersData.map(customer => ({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          content: customer.email,
          icon: 'user',
          url: `/customers/customer-list`,
          metadata: {
            email: customer.email,
            totalOrders: customer.total_orders || 0,
            totalSpent: customer.total_spent || 0,
          },
        }));
        results.total += customersData.length;
      }
    }

    // Search orders
    if (types.includes('orders')) {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (name, email)
        `)
        .or(`id::text.ilike.%${query}%,status.ilike.%${query}%`)
        .limit(limit);

      if (!ordersError && ordersData) {
        results.orders = ordersData.map(order => ({
          id: order.id,
          type: 'order',
          title: `Order #${order.id.slice(0, 8)}`,
          content: `${order.status} - $${order.total_amount}`,
          icon: 'payment',
          url: `/orders/${order.id}`,
          metadata: {
            status: order.status,
            totalAmount: order.total_amount,
            customerName: order.customers?.name,
            customerEmail: order.customers?.email,
          },
        }));
        results.total += ordersData.length;
      }
    }

    return { data: results, error: null };
  } catch (error) {
    console.error('Global search error:', error);
    return { data: null, error };
  }
};

/**
 * Get search suggestions based on partial query
 * @param {string} query - Partial search query
 * @param {number} limit - Number of suggestions
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getSearchSuggestions = async (query, limit = 5) => {
  try {
    if (!query || query.length < 2) {
      return { data: [], error: null };
    }

    const suggestions = [];

    // Get product suggestions
    const { data: products } = await supabase
      .from('products')
      .select('name, category')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (products) {
      products.forEach(product => {
        suggestions.push({
          title: product.name,
          content: product.category || 'Product',
          icon: 'shopping-bag',
          query: product.name,
        });
      });
    }

    // Get category suggestions
    const { data: categories } = await supabase
      .from('products')
      .select('category')
      .ilike('category', `%${query}%`)
      .limit(3);

    if (categories) {
      const uniqueCategories = [...new Set(categories.map(c => c.category).filter(Boolean))];
      uniqueCategories.forEach(category => {
        if (!suggestions.some(s => s.title === category)) {
          suggestions.push({
            title: category,
            content: 'Category',
            icon: 'folder',
            query: category,
          });
        }
      });
    }

    return { data: suggestions.slice(0, limit), error: null };
  } catch (error) {
    console.error('Get suggestions error:', error);
    return { data: [], error };
  }
};

/**
 * Save search to recent searches (local storage for now)
 * @param {string} query - Search query
 * @param {Object} result - Search result item that was clicked
 */
export const saveRecentSearch = (query, result) => {
  try {
    const storageKey = 'recentSearches';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const newSearch = {
      query,
      result: {
        id: result.id,
        type: result.type,
        title: result.title,
        content: result.content,
        image: result.image,
        image2x: result.image2x,
        icon: result.icon,
        url: result.url,
      },
      timestamp: new Date().toISOString(),
    };

    // Remove duplicate if exists
    const filtered = existing.filter(
      item => !(item.result.id === result.id && item.result.type === result.type)
    );

    // Add to beginning and limit to 10 items
    const updated = [newSearch, ...filtered].slice(0, 10);

    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

/**
 * Get recent searches from local storage
 * @param {number} limit - Number of recent searches to return
 * @returns {Array}
 */
export const getRecentSearches = (limit = 5) => {
  try {
    const storageKey = 'recentSearches';
    const recent = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return recent.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem('recentSearches');
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

/**
 * Quick search for specific entity type
 * @param {string} type - Entity type (products, customers, orders)
 * @param {string} query - Search query
 * @param {number} limit - Result limit
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const quickSearch = async (type, query, limit = 10) => {
  try {
    switch (type) {
      case 'products':
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);
        return { data: products, error: productsError };

      case 'customers':
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);
        return { data: customers, error: customersError };

      case 'orders':
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*, customers(name, email)')
          .limit(limit);
        return { data: orders, error: ordersError };

      default:
        return { data: [], error: { message: 'Invalid search type' } };
    }
  } catch (error) {
    console.error('Quick search error:', error);
    return { data: [], error };
  }
};
