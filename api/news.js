const https = require('https');
const { URL } = require('url');

module.exports = function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Get query parameters
        const q = req.query.q || 'technology';
        const language = req.query.language || 'en';
        const pageSize = req.query.pageSize || '30';
        const country = req.query.country || '';
        
        // Build NewsAPI URL
        const apiKey = 'ff954d9cc07846abba3a0042abf89219';
        const newsApiUrl = new URL('https://newsapi.org/v2/everything');
        newsApiUrl.searchParams.set('apiKey', apiKey);
        newsApiUrl.searchParams.set('q', q);
        newsApiUrl.searchParams.set('language', language);
        newsApiUrl.searchParams.set('pageSize', pageSize);
        newsApiUrl.searchParams.set('sortBy', 'publishedAt');

        // Make the request to NewsAPI
        const request = https.get(newsApiUrl.toString(), (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const newsData = JSON.parse(data);
                    
                    if (newsData.status === 'error') {
                        res.status(400).json({
                            error: 'NewsAPI error',
                            message: newsData.message || 'Unknown NewsAPI error'
                        });
                        return;
                    }

                    res.status(200).json(newsData);
                } catch (parseError) {
                    res.status(500).json({
                        error: 'JSON parse error',
                        message: parseError.message
                    });
                }
            });
        });

        request.on('error', (error) => {
            res.status(500).json({
                error: 'HTTP request error',
                message: error.message
            });
        });

        request.setTimeout(10000, () => {
            request.destroy();
            res.status(408).json({
                error: 'Request timeout',
                message: 'NewsAPI request took too long'
            });
        });

    } catch (error) {
        res.status(500).json({
            error: 'Function error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};