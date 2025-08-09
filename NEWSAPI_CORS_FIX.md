# NewsAPI CORS Issue Solution

## Problem
NewsAPI.org's free Developer plan only allows requests from `localhost`. When you deploy your app to production (Vercel, Netlify, etc.), you'll get a 426 CORS error:

```
Failed to load resource: the server responded with a status of 426 ()
NewsAPI error: {status: 'error', code: 'corsNotAllowed', message: 'Requests from the browser are not allowed on the Developer plan, except from localhost.'}
```

## Solution: Serverless Proxy

We've implemented a serverless function that acts as a proxy between your frontend and NewsAPI:

### Files Added:
- `/api/news.ts` - Serverless function that proxies NewsAPI requests
- `/vercel.json` - Vercel configuration for the API function

### How It Works:
1. **Local Development** (`localhost`): Calls NewsAPI directly ✅
2. **Production**: Uses the `/api/news` proxy endpoint ✅

### Deployment Steps:

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Or Deploy to Other Platforms:**
   The app automatically detects the environment and routes requests appropriately.

### Environment Variables:
The API key is hardcoded in the serverless function for simplicity. For production, consider using environment variables:

```bash
# In Vercel dashboard or via CLI:
vercel env add NEWS_API_KEY
```

Then update `/api/news.ts`:
```typescript
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'fallback_key';
```

### Alternative Solutions:
1. **Upgrade NewsAPI Plan**: $449/month for unlimited domains
2. **Switch to Alternative APIs**: Use APIs that support CORS
3. **Backend Server**: Create a dedicated backend server

## Testing:
- **Local**: Should work normally at `http://localhost:5174`
- **Production**: Will use proxy automatically when deployed
