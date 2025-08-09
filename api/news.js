const axios = require('axios');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { q, language, sortBy, pageSize, category, country, sources } = req.query;
    
    // Your NewsAPI key - in production, this should be an environment variable
    const NEWS_API_KEY = 'ff954d9cc07846abba3a0042abf89219';
    
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      ...(q && { q }),
      ...(language && { language }),
      ...(sortBy && { sortBy }),
      ...(pageSize && { pageSize }),
      ...(category && { category }),
      ...(country && { country }),
      ...(sources && { sources })
    });

    // Determine which NewsAPI endpoint to use
    let endpoint = 'everything';
    if (category || country) {
      endpoint = 'top-headlines';
    }

    const response = await axios.get(`https://newsapi.org/v2/${endpoint}`, {
      params: Object.fromEntries(params),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('NewsAPI proxy error:', error);
    
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: 'NewsAPI request failed',
        message: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch news'
      });
    }
  }
};
