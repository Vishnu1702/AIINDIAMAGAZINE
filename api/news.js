export default async function handler(req, res) {
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
        console.log('NewsAPI request received:', req.query);
        
        // Get query parameters
        const q = req.query.q || 'technology';
        const language = req.query.language || 'en';
        const pageSize = req.query.pageSize || '30';
        
        // Build NewsAPI URL
        const apiKey = 'ff954d9cc07846abba3a0042abf89219';
        const newsApiUrl = new URL('https://newsapi.org/v2/everything');
        newsApiUrl.searchParams.set('apiKey', apiKey);
        newsApiUrl.searchParams.set('q', q);
        newsApiUrl.searchParams.set('language', language);
        newsApiUrl.searchParams.set('pageSize', pageSize);
        newsApiUrl.searchParams.set('sortBy', 'publishedAt');

        console.log('Making request to NewsAPI:', newsApiUrl.toString());

        // Use fetch instead of https module for better compatibility
        const response = await fetch(newsApiUrl.toString());
        
        if (!response.ok) {
            throw new Error(`NewsAPI HTTP error! status: ${response.status}`);
        }
        
        const newsData = await response.json();
        
        if (newsData.status === 'error') {
            console.error('NewsAPI error:', newsData);
            return res.status(400).json({
                error: 'NewsAPI error',
                message: newsData.message || 'Unknown NewsAPI error',
                code: newsData.code
            });
        }

        console.log('NewsAPI response received, articles:', newsData.articles?.length || 0);
        
        res.status(200).json(newsData);

    } catch (error) {
        console.error('Function error:', error);
        res.status(500).json({
            error: 'Function error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}