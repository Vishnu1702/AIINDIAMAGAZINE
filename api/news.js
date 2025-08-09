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

    // For debugging - return a simple response first
    try {
        res.status(200).json({
            status: 'ok',
            message: 'Minimal API function is working',
            timestamp: new Date().toISOString(),
            method: req.method,
            query: req.query
        });
    } catch (error) {
        res.status(500).json({
            error: 'Function error',
            message: error.message
        });
    }
};