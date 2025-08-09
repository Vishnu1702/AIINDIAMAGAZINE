// Simple test endpoint for debugging - using only Node.js built-ins
module.exports = async function handler(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        res.status(200).json({
            status: 'ok',
            message: 'API function is working with Node.js built-ins',
            timestamp: new Date().toISOString(),
            method: req.method,
            query: req.query,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            },
            headers: {
                'user-agent': req.headers['user-agent'] || 'unknown',
                'host': req.headers.host || 'unknown'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
