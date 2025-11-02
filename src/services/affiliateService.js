import supabase from '../config/supabaseClient';

// Affiliate Service - Handles affiliate/referral tracking and analytics
// Note: This uses the existing traffic_sources and sessions tables for affiliate tracking

/**
 * Get affiliate snapshot data (clicks, payouts, etc.)
 * @param {string} period - Time period ('7days', 'month', 'all')
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getAffiliateSnapshot = async (period = '7days') => {
  try {
    let dateFilter = null;

    if (period === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = sevenDaysAgo.toISOString();
    } else if (period === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = thirtyDaysAgo.toISOString();
    }

    // Get clicks from traffic sources where source is 'referral'
    let clicksQuery = supabase
      .from('traffic_sources')
      .select('visitors, conversions, created_at')
      .eq('source', 'referral');

    if (dateFilter) {
      clicksQuery = clicksQuery.gte('created_at', dateFilter);
    }

    const { data: clicksData, error: clicksError } = await clicksQuery;

    // Get affiliate payouts from transactions
    let payoutsQuery = supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('type', 'payout');

    if (dateFilter) {
      payoutsQuery = payoutsQuery.gte('created_at', dateFilter);
    }

    const { data: payoutsData, error: payoutsError } = await payoutsQuery;

    if (clicksError || payoutsError) {
      return {
        data: null,
        error: clicksError || payoutsError
      };
    }

    const totalClicks = clicksData?.reduce((sum, item) => sum + (item.visitors || 0), 0) || 0;
    const totalPayouts = payoutsData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Calculate growth percentages (comparing to previous period)
    // For simplicity, we'll use mock percentages here
    const clicksGrowth = 37.8;
    const payoutsGrowth = -12.5;

    // Prepare chart data for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData = clicksData?.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.toDateString() === date.toDateString();
      }) || [];

      chartData.push({
        name: (date.getDate()).toString(),
        value: dayData.reduce((sum, item) => sum + (item.visitors || 0), 0)
      });
    }

    return {
      data: {
        clicks: totalClicks,
        clicksGrowth,
        payouts: totalPayouts,
        payoutsGrowth,
        chartData
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get affiliate performance by day
 * @param {string} period - Time period ('7days', 'month', 'all')
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAffiliatePerformanceByDay = async (period = '7days') => {
  try {
    let dateFilter = null;
    const days = period === '7days' ? 7 : period === 'month' ? 30 : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    dateFilter = startDate.toISOString();

    const { data: clicksData, error } = await supabase
      .from('traffic_sources')
      .select('visitors, created_at')
      .eq('source', 'referral')
      .gte('created_at', dateFilter)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Group by day
    const dailyData = {};
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dailyData[dayKey] = { name: date.getDate().toString(), click: 0 };
    }

    clicksData?.forEach(item => {
      const dayKey = item.created_at.split('T')[0];
      if (dailyData[dayKey]) {
        dailyData[dayKey].click += item.visitors || 0;
      }
    });

    const chartData = Object.values(dailyData);

    return { data: chartData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get affiliate performance table data
 * @param {number} limit - Number of days to return
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getAffiliatePerformanceTable = async (limit = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    // Get clicks/impressions from traffic sources
    const { data: trafficData, error: trafficError } = await supabase
      .from('traffic_sources')
      .select('*')
      .eq('source', 'referral')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Get earnings from transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('type', 'payout')
      .gte('created_at', startDate.toISOString());

    if (trafficError || transactionsError) {
      return {
        data: null,
        error: trafficError || transactionsError
      };
    }

    // Group by date and combine data
    const dailyPerformance = {};

    trafficData?.forEach(item => {
      const date = new Date(item.created_at);
      const dateKey = date.toISOString().split('T')[0];
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      if (!dailyPerformance[dateKey]) {
        dailyPerformance[dateKey] = {
          date: formattedDate,
          impressions: { counter: 0, value: 0 },
          clicks: { counter: 0, value: 0 },
          total: 0,
          epc: 0
        };
      }

      dailyPerformance[dateKey].impressions.counter += item.visitors || 0;
      dailyPerformance[dateKey].clicks.counter += item.conversions || 0;
    });

    // Add earnings
    transactionsData?.forEach(item => {
      const dateKey = item.created_at.split('T')[0];
      if (dailyPerformance[dateKey]) {
        dailyPerformance[dateKey].total += item.amount || 0;
      }
    });

    // Calculate EPC (Earnings Per Click) and growth percentages
    const result = Object.values(dailyPerformance).map(day => {
      if (day.clicks.counter > 0) {
        day.epc = day.total / day.clicks.counter;
      }
      // Mock growth percentages
      day.impressions.value = Math.random() * 40 - 20;
      day.clicks.value = Math.random() * 40 - 20;
      return day;
    });

    return { data: result.slice(0, limit), error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create affiliate link
 * @param {Object} linkData - Link data (url, campaign, etc.)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const createAffiliateLink = async (linkData) => {
  try {
    // Generate a unique referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Store in traffic_sources as a placeholder
    // In a real implementation, you'd have a dedicated affiliate_links table
    const { data, error } = await supabase
      .from('traffic_sources')
      .insert([
        {
          source: 'referral',
          visitors: 0,
          conversions: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        ...data,
        referralCode,
        link: `${window.location.origin}/ref/${referralCode}`
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Track affiliate click
 * @param {string} referralCode - Referral code
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const trackAffiliateClick = async (referralCode) => {
  try {
    // This would increment the click count for the referral code
    // Implementation depends on your affiliate tracking structure

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          referrer: `ref_${referralCode}`,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
