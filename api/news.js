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

        // Your NewsAPI key
        const NEWS_API_KEY = 'ff954d9cc07846abba3a0042abf89219';

        // Build parameters object
        const params = {
            apiKey: NEWS_API_KEY,
            language: language || 'en',
            sortBy: sortBy || 'publishedAt',
            pageSize: pageSize || '30'
        };

        // Add optional parameters only if they exist
        if (q) params.q = q;
        if (category) params.category = category;
        if (country) params.country = country;
        if (sources) params.sources = sources;

        // Determine which NewsAPI endpoint to use
        let endpoint = 'everything';
        if (category || country) {
            endpoint = 'top-headlines';
        }

        console.log('API Request:', `https://newsapi.org/v2/${endpoint}`, params);

        const response = await axios.get(`https://newsapi.org/v2/${endpoint}`, {
            params,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DesiAIMagazine/1.0'
            },
            timeout: 10000
        });

        console.log('API Response status:', response.status);
        res.status(200).json(response.data);
        
    } catch (error) {
        console.error('NewsAPI proxy error:', error.message);
        console.error('Error details:', error.response?.data);

        if (error.response) {
            // Forward the exact error from NewsAPI
            res.status(500).json({
                error: 'NewsAPI request failed',
                message: error.message,
                status: error.response.status,
                details: error.response.data
            });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({
                error: 'Request timeout',
                message: 'NewsAPI request timed out'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message || 'Failed to fetch news'
            });
        }
    }
};
