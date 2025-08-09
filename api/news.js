// Use Node.js built-in modules instead of axios
const https = require('https');
const { URL } = require('url');

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

        // Build URL with query parameters
        const baseUrl = `https://newsapi.org/v2/${endpoint}`;
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${baseUrl}?${queryString}`;

        console.log('Making request to:', fullUrl);

        // Make HTTP request using Node.js built-in https
        const data = await makeHttpRequest(fullUrl);
        
        console.log('API Response received');
        res.status(200).json(JSON.parse(data));
        
    } catch (error) {
        console.error('NewsAPI proxy error:', error.message);

        res.status(500).json({
            error: 'NewsAPI request failed',
            message: error.message || 'Failed to fetch news',
            timestamp: new Date().toISOString()
        });
    }
};

// Helper function to make HTTP requests using Node.js built-in https
function makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DesiAIMagazine/1.0'
            }
        };

        const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                }
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });

        request.end();
    });
}