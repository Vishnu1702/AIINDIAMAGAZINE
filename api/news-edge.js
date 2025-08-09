// Alternative approach: Edge function using Web APIs
export default async function handler(request) {
    // Handle CORS
    const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    });

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    try {
        // Get query parameters
        const url = new URL(request.url);
        const q = url.searchParams.get('q') || 'technology';
        const language = url.searchParams.get('language') || 'en';
        const pageSize = url.searchParams.get('pageSize') || '30';
        
        // Build NewsAPI URL
        const apiKey = 'ff954d9cc07846abba3a0042abf89219';
        const newsApiUrl = new URL('https://newsapi.org/v2/everything');
        newsApiUrl.searchParams.set('apiKey', apiKey);
        newsApiUrl.searchParams.set('q', q);
        newsApiUrl.searchParams.set('language', language);
        newsApiUrl.searchParams.set('pageSize', pageSize);
        newsApiUrl.searchParams.set('sortBy', 'publishedAt');

        // Make request to NewsAPI
        const response = await fetch(newsApiUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DesiAIMagazine/1.0'
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.ok ? 200 : response.status,
            headers
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Request failed',
            message: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers
        });
    }
}

export const config = {
    runtime: 'edge'
};
