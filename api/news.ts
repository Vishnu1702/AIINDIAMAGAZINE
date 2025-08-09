import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      ...(q && { q: q as string }),
      ...(language && { language: language as string }),
      ...(sortBy && { sortBy: sortBy as string }),
      ...(pageSize && { pageSize: pageSize as string }),
      ...(category && { category: category as string }),
      ...(country && { country: country as string }),
      ...(sources && { sources: sources as string })
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
    
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: 'NewsAPI request failed',
        message: error.message,
        details: error.response?.data
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch news'
      });
    }
  }
}
