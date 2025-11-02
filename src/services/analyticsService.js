import supabase from '../config/supabaseClient';

// Analytics Service - Handles dashboard analytics and statistics

/**
 * Get dashboard overview statistics
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getDashboardStats = async () => {
  try {
    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total customers
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (revenueError || ordersError || productsError || customersError) {
      return {
        data: null,
        error: revenueError || ordersError || productsError || customersError
      };
    }

    return {
      data: {
        revenue: totalRevenue,
        orders: totalOrders,
        products: totalProducts,
        customers: totalCustomers,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get sales data over time
 * @param {string} period - Time period (day, week, month, year)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getSalesData = async (period = 'month') => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get product views analytics
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getProductViews = async () => {
  try {
    const { data, error } = await supabase
      .from('product_views')
      .select('*, products(*)')
      .order('view_count', { ascending: false })
      .limit(10);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get top selling products
 * @param {number} limit - Number of products to return
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getTopProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, order_items(quantity)')
      .order('sales_count', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer growth data
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCustomerGrowth = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('created_at')
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get traffic sources
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getTrafficSources = async () => {
  try {
    const { data, error } = await supabase
      .from('traffic_sources')
      .select('*')
      .order('visitors', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get conversion rate
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getConversionRate = async () => {
  try {
    const { count: totalVisitors, error: visitorsError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (visitorsError || ordersError) {
      return {
        data: null,
        error: visitorsError || ordersError
      };
    }

    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    return {
      data: {
        conversionRate,
        totalVisitors,
        totalOrders,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get product activity data by week
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getProductActivity = async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('created_at')
      .gte('created_at', twoWeeksAgo.toISOString());

    const { data: viewsData, error: viewsError } = await supabase
      .from('product_views')
      .select('created_at, view_count')
      .gte('created_at', twoWeeksAgo.toISOString());

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('created_at')
      .gte('created_at', twoWeeksAgo.toISOString());

    if (productsError || viewsError || commentsError) {
      return {
        data: null,
        error: productsError || viewsError || commentsError
      };
    }

    const getWeekRange = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
      };

      return `${formatDate(monday)} - ${formatDate(sunday)}`;
    };

    const weeks = {};
    const addToWeek = (date, type) => {
      const weekRange = getWeekRange(date);
      if (!weeks[weekRange]) {
        weeks[weekRange] = { products: 0, views: 0, likes: 0, comments: 0 };
      }
      if (type === 'product') weeks[weekRange].products += 1;
      if (type === 'view') weeks[weekRange].views += 1;
      if (type === 'comment') weeks[weekRange].comments += 1;
    };

    productsData?.forEach(p => addToWeek(p.created_at, 'product'));
    viewsData?.forEach(v => addToWeek(v.created_at, 'view'));
    commentsData?.forEach(c => addToWeek(c.created_at, 'comment'));

    const result = Object.keys(weeks).map(weekRange => ({
      title: weekRange,
      products: weeks[weekRange].products,
      views: weeks[weekRange].views,
      likes: weeks[weekRange].likes,
      comments: weeks[weekRange].comments,
    }));

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get customer analytics data over time period
 * @param {number} days - Number of days to look back (7, 14, 28)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCustomerAnalytics = async (days = 28) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get customers created in the time period
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get total customer count
    const { count: totalCustomers, error: countError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const { count: previousPeriodCount, error: previousError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    if (customersError || countError || previousError) {
      return {
        data: null,
        error: customersError || countError || previousError
      };
    }

    // Calculate growth percentage
    const currentPeriodCount = customersData?.length || 0;
    const growthPercentage = previousPeriodCount > 0
      ? ((currentPeriodCount - previousPeriodCount) / previousPeriodCount * 100).toFixed(1)
      : currentPeriodCount > 0 ? 100 : 0;

    // Group by week for chart data
    const weeklyData = {};
    customersData?.forEach(customer => {
      const date = new Date(customer.created_at);
      const weekStart = new Date(date);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = weekStart.toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          name: formattedDate,
          customers: 0,
          date: weekStart
        };
      }
      weeklyData[weekKey].customers += 1;
    });

    // Convert to array and sort by date
    const chartData = Object.values(weeklyData)
      .sort((a, b) => a.date - b.date)
      .map(({ name, customers }) => ({ name, customers }));

    // Calculate cumulative customers for chart
    let cumulativeCount = totalCustomers - currentPeriodCount;
    const cumulativeChartData = chartData.map(item => {
      cumulativeCount += item.customers;
      return {
        name: item.name,
        customers: cumulativeCount
      };
    });

    return {
      data: {
        totalCustomers,
        currentPeriodCount,
        previousPeriodCount,
        growthPercentage,
        chartData: cumulativeChartData
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Helper function to detect device type from user agent
 * @param {string} userAgent - Browser user agent string
 * @returns {string} - Device type: 'mobile', 'tablet', or 'desktop'
 */
const detectDeviceType = (userAgent) => {
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();

  // Check for tablet first (more specific)
  if (ua.includes('ipad') ||
      (ua.includes('android') && !ua.includes('mobile')) ||
      ua.includes('tablet')) {
    return 'tablet';
  }

  // Check for mobile
  if (ua.includes('mobile') ||
      ua.includes('iphone') ||
      ua.includes('ipod') ||
      ua.includes('android') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')) {
    return 'mobile';
  }

  // Default to desktop
  return 'desktop';
};

/**
 * Get device analytics from sessions
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getDeviceAnalytics = async () => {
  try {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('user_agent');

    if (sessionsError) {
      return { data: null, error: sessionsError };
    }

    // Count devices
    const deviceCounts = {
      mobile: 0,
      tablet: 0,
      desktop: 0
    };

    sessionsData?.forEach(session => {
      const deviceType = detectDeviceType(session.user_agent);
      deviceCounts[deviceType]++;
    });

    const totalSessions = sessionsData?.length || 0;

    // Calculate percentages
    const mobilePercent = totalSessions > 0 ? Math.round((deviceCounts.mobile / totalSessions) * 100) : 0;
    const tabletPercent = totalSessions > 0 ? Math.round((deviceCounts.tablet / totalSessions) * 100) : 0;
    const desktopPercent = totalSessions > 0 ? Math.round((deviceCounts.desktop / totalSessions) * 100) : 0;

    // Prepare data for chart
    const chartData = [
      { name: 'Mobile', value: deviceCounts.mobile },
      { name: 'Tablet', value: deviceCounts.tablet },
      { name: 'Desktop', value: deviceCounts.desktop }
    ];

    // Prepare legend data
    const legend = [
      {
        title: 'Mobile',
        percent: mobilePercent,
        count: deviceCounts.mobile,
        icon: 'mobile',
        fill: '#8E59FF'
      },
      {
        title: 'Tablet',
        percent: tabletPercent,
        count: deviceCounts.tablet,
        icon: 'tablet',
        fill: '#83BF6E'
      },
      {
        title: 'Desktop',
        percent: desktopPercent,
        count: deviceCounts.desktop,
        icon: 'desktop',
        fill: '#2A85FF'
      }
    ];

    return {
      data: {
        chartData,
        legend,
        totalSessions
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};
