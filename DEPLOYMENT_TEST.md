# Vercel Deployment Test

## Test the API Function Locally

You can test the API function locally using:

```bash
# Install vercel CLI if not already installed
npm install -g vercel

# Run the dev server
vercel dev
```

Then visit: `http://localhost:3000/api/news?q=artificial+intelligence&pageSize=5`

## Test After Deployment

After deploying to Vercel, test the API endpoint:

```bash
curl "https://your-app.vercel.app/api/news?q=artificial+intelligence&pageSize=5"
```

## Common Issues and Solutions

### 1. Runtime Error Fixed ✅
- **Problem**: "Function Runtimes must have a valid version"
- **Solution**: Converted from TypeScript to JavaScript, removed runtime specification

### 2. CORS Headers
- **Problem**: Browser blocks API requests
- **Solution**: Added proper CORS headers in both vercel.json and the function

### 3. API Key Security
- **Current**: API key is in the code (for simplicity)
- **Recommended**: Move to environment variables in production

### 4. Request Parameters
- **Supported**: q, language, sortBy, pageSize, category, country, sources
- **Endpoint**: Automatically selects 'everything' or 'top-headlines'

## Environment Variables (Optional)

For production, consider setting:

```bash
vercel env add NEWS_API_KEY
```

Then update api/news.js:
```javascript
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'fallback_key';
```
