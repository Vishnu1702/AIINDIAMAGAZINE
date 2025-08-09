// Simple test endpoint for debugging
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    res.status(200).json({
        status: 'ok',
        message: 'API function is working',
        timestamp: new Date().toISOString(),
        method: req.method,
        query: req.query,
        headers: {
            'user-agent': req.headers['user-agent'],
            'host': req.headers.host
        }
    });
};
