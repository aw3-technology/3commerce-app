const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample user agents for different devices
const userAgents = {
  mobile: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 10; SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36',
  ],
  tablet: [
    'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/92.0.4515.90 Mobile/15E148 Safari/604.1',
  ],
  desktop: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  ]
};

// Generate random session data
const generateSessions = (count) => {
  const sessions = [];
  const deviceTypes = ['mobile', 'tablet', 'desktop'];

  // Distribution: 20% mobile, 5% tablet, 75% desktop (as per original mockup)
  const distribution = {
    mobile: Math.floor(count * 0.20),
    tablet: Math.floor(count * 0.05),
    desktop: Math.floor(count * 0.75)
  };

  for (const [deviceType, deviceCount] of Object.entries(distribution)) {
    for (let i = 0; i < deviceCount; i++) {
      const userAgentList = userAgents[deviceType];
      const userAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

      sessions.push({
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_agent: userAgent,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        referrer: ['https://google.com', 'https://facebook.com', 'direct', 'https://twitter.com'][Math.floor(Math.random() * 4)],
        pages_viewed: Math.floor(Math.random() * 10) + 1,
        duration: Math.floor(Math.random() * 3600), // 0-3600 seconds
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
      });
    }
  }

  return sessions;
};

async function insertSampleSessions() {
  console.log('Starting to insert sample session data...');

  try {
    // Generate 1700 sessions (matching the original mockup: 340 mobile + 85 tablet + 1275 desktop = 1700)
    const sessions = generateSessions(1700);

    console.log(`Generated ${sessions.length} sample sessions`);

    // Insert in batches of 100 to avoid timeout
    const batchSize = 100;
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('sessions')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(sessions.length / batchSize)}`);
    }

    console.log('✅ Successfully inserted all sample sessions!');
    console.log('\nDevice distribution:');
    console.log('- Mobile: ~20% (~340 sessions)');
    console.log('- Tablet: ~5% (~85 sessions)');
    console.log('- Desktop: ~75% (~1275 sessions)');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Run the script
insertSampleSessions();
