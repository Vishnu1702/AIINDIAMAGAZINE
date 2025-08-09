import axios from 'axios';
import type { NewsArticle, NewsFilter } from '../types/news';

class NewsService {
    private readonly NEWS_API_KEY = 'ff954d9cc07846abba3a0042abf89219'; // Get from newsapi.org
    private readonly NEWS_AI_API_KEY = import.meta.env.VITE_NEWS_AI_API_KEY || 'demo';
    private readonly NEWS_DATA_API_KEY = import.meta.env.VITE_NEWS_DATA_API_KEY || 'demo';

    // Simple cache to avoid repeated API calls
    private cache = new Map<string, { data: NewsArticle[], timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Method to clear cache when query logic changes
    public clearCache(): void {
        this.cache.clear();
        console.log('News cache cleared');
    }

    // Detect if running locally or in production
    private getNewsApiUrl(): string {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // Local development - use NewsAPI directly
            return 'https://newsapi.org/v2';
        } else {
            // Production - use our serverless proxy
            return '/api/news';
        }
    }

    private readonly BASE_URLS = {
        newsAi: 'https://eventregistry.org/api/v1',
        newsData: 'https://newsdata.io/api/1',
    };

    // Create SVG placeholder images as data URIs
    private createPlaceholderImage(text: string, bgColor: string = '#0066CC'): string {
        // Create a gradient background for more visual appeal
        const lightColor = this.lightenColor(bgColor, 20);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${lightColor};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="200" fill="url(#grad)"/>
            <circle cx="200" cy="80" r="25" fill="white" opacity="0.1"/>
            <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
            <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">News Article</text>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Helper function to lighten a color
    private lightenColor(color: string, percent: number): string {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    // Smart image URL handling with fallbacks
    private getValidImageUrl(imageUrl: string | null | undefined, title: string, category: string): string {
        // If we have a valid image URL, return it
        if (imageUrl && this.isValidImageUrl(imageUrl)) {
            // Add error handling parameter for broken images
            return imageUrl;
        }

        // Common broken image patterns from NewsAPI
        const brokenPatterns = [
            'removed.png',
            'default.jpg',
            'placeholder.jpg',
            'no-image',
            'image-not-found',
            '/removed',
            'https://www.facebook.com/tr',
            'https://sb.scorecardresearch.com'
        ];

        if (imageUrl && brokenPatterns.some(pattern => imageUrl.includes(pattern))) {
            console.log('Detected broken image pattern, using placeholder:', imageUrl);
        }

        // Create a contextual placeholder based on article content
        const placeholderText = this.getPlaceholderText(title, category);
        const placeholderColor = this.getPlaceholderColor(category);

        return this.createPlaceholderImage(placeholderText, placeholderColor);
    }

    // Check if image URL is likely valid
    private isValidImageUrl(url: string): boolean {
        if (!url || url.trim() === '') return false;
        if (url === 'null' || url === 'undefined') return false;
        
        // Check for common invalid patterns from NewsAPI
        if (url.includes('removed.png') || url.includes('default.jpg')) return false;
        if (url.endsWith('/removed') || url.includes('placeholder')) return false;

        try {
            const urlObj = new URL(url);
            // Must be http or https
            if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
            
            // Check for common image extensions
            const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
            const hasImageExtension = imageExtensions.test(url);

            // Check for common image hosting patterns
            const imageHostPatterns = /(images?|media|cdn|static|assets|img|photo|picture)/i;
            const hasImageHost = imageHostPatterns.test(url);

            // Check for data URLs
            if (url.startsWith('data:image/')) return true;

            // Must have either image extension or be from image hosting domain
            return hasImageExtension || hasImageHost;
        } catch {
            // Invalid URL format
            return false;
        }
    }

    // Generate contextual placeholder text
    private getPlaceholderText(title: string = '', category: string): string {
        const words = title.toLowerCase();

        // AI-related keywords
        if (words.includes('ai') || words.includes('artificial') || words.includes('machine learning') || words.includes('ml')) {
            return 'AI News';
        }

        // Startup-related keywords  
        if (words.includes('startup') || words.includes('funding') || words.includes('unicorn') || words.includes('venture')) {
            return 'Startup';
        }

        // Company-specific
        if (words.includes('google') || words.includes('alphabet')) return 'Google';
        if (words.includes('microsoft')) return 'Microsoft';
        if (words.includes('openai') || words.includes('chatgpt')) return 'OpenAI';
        if (words.includes('tesla')) return 'Tesla';
        if (words.includes('meta') || words.includes('facebook')) return 'Meta';
        if (words.includes('amazon')) return 'Amazon';
        if (words.includes('apple')) return 'Apple';
        if (words.includes('nvidia')) return 'NVIDIA';
        if (words.includes('tcs')) return 'TCS';
        if (words.includes('infosys')) return 'Infosys';
        if (words.includes('wipro')) return 'Wipro';

        // Indian companies
        if (words.includes('reliance')) return 'Reliance';
        if (words.includes('flipkart')) return 'Flipkart';
        if (words.includes('paytm')) return 'Paytm';
        if (words.includes('byju')) return 'BYJU\'S';
        if (words.includes('zomato')) return 'Zomato';
        if (words.includes('swiggy')) return 'Swiggy';

        // Technology categories
        if (words.includes('robot') || words.includes('automation')) return 'Robotics';
        if (words.includes('crypto') || words.includes('bitcoin') || words.includes('blockchain')) return 'Crypto';
        if (words.includes('cloud')) return 'Cloud';
        if (words.includes('mobile') || words.includes('app')) return 'Mobile';

        // Default based on category
        if (category === 'ai') return 'AI News';
        if (category === 'startup') return 'Startup';

        return 'Tech News';
    }

    // Get color based on category and content
    private getPlaceholderColor(category: string): string {
        switch (category) {
            case 'ai': return '#0066CC';           // AI Blue
            case 'startup': return '#00CC66';     // Startup Green  
            default: return '#6B7280';            // Gray for general tech
        }
    }

    // Indian news sources RSS feeds
    private readonly INDIAN_RSS_FEEDS = {
        // Technology & AI focused
        et_tech: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
        livemint_tech: 'https://www.livemint.com/rss/technology',
        times_tech: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
        hindu_sci_tech: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss',
        business_standard_tech: 'https://www.business-standard.com/rss/technology-106.rss',
        analytics_india: 'https://analyticsindiamag.com/feed/',

        // Startup & Business focused  
        inc42: 'https://inc42.com/feed/',
        yourstory: 'https://yourstory.com/feed',
        entrackr: 'https://entrackr.com/feed/',
        vccircle: 'https://www.vccircle.com/feed/',
        livemint_companies: 'https://www.livemint.com/rss/companies',
        et_startups: 'https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/63319174.cms',
        medianama: 'https://www.medianama.com/feed/',

        // General business with tech coverage
        business_today: 'https://www.businesstoday.in/rss/technology-news',
        financial_express_tech: 'https://www.financialexpress.com/rss/industry-technology/feed/',
        news18_tech: 'https://www.news18.com/rss/tech.xml',
        zee_business_tech: 'https://zeenews.india.com/rss/business.xml'
    };

    // NewsAPI.org - General news with country/category filters
    async getNewsApiArticles(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            const baseUrl = this.getNewsApiUrl();
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            const params = new URLSearchParams({
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: '30', // Increased from 20 to get more articles
            });

            // Add API key only for localhost (direct NewsAPI calls)
            if (isLocalhost) {
                params.append('apiKey', this.NEWS_API_KEY);
            }

            // Build more specific queries to avoid irrelevant matches
            let query = '';
            if (filters.category === 'ai') {
                // More specific AI query to avoid false positives like sports articles
                query = '"artificial intelligence" OR "machine learning" OR "deep learning" OR "neural network" OR "AI technology" OR "AI model" OR "generative AI" OR "ChatGPT" OR "OpenAI"';
            } else if (filters.category === 'startup') {
                query = 'startup OR "venture capital" OR "series A" OR "series B" OR "series C" OR funding OR "seed round" OR unicorn';
            } else {
                query = 'technology';
            }

            // For India-specific content, enhance the query with Indian sources and terms
            if (filters.region === 'india') {
                if (filters.category === 'ai') {
                    query += ' AND (India OR Indian OR Mumbai OR Bangalore OR Delhi OR "Tech Mahindra" OR Infosys OR TCS OR Wipro OR "IIT" OR "Indian Institute")';
                } else if (filters.category === 'startup') {
                    query += ' AND (India OR Indian OR Mumbai OR Bangalore OR Delhi OR Hyderabad OR "Indian startup" OR "India funding" OR Flipkart OR Paytm OR Zomato OR Swiggy OR "YourStory" OR "Inc42")';
                } else {
                    query += ' AND India';
                }
            }

            params.append('q', query);

            let apiUrl;
            if (isLocalhost) {
                // Local development - call NewsAPI directly
                apiUrl = `${baseUrl}/everything`;
                console.log('Fetching news directly from NewsAPI (localhost):', `${apiUrl}?${params.toString()}`);
            } else {
                // Production - use our serverless proxy
                apiUrl = baseUrl;
                console.log('Fetching news via proxy (production):', `${apiUrl}?${params.toString()}`);
            }

            const response = await axios.get(apiUrl, {
                params: Object.fromEntries(params),
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000, // 5 second timeout for faster loading
            });

            console.log('NewsAPI response status:', response.status);
            console.log('NewsAPI response data keys:', Object.keys(response.data));
            const transformedArticles = this.transformNewsApiResponse(response.data, filters);
            console.log('Transformed articles from NewsAPI:', transformedArticles.length);
            return transformedArticles;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('NewsAPI error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });

                // If it's a 400 error, try with simpler query
                if (error.response?.status === 400) {
                    console.log('Retrying with simpler query...');
                    return this.getSimpleNewsApiArticles(filters);
                }
            } else {
                console.error('NewsAPI error:', error);
            }
            // Return empty array if API fails
            return [];
        }
    }

    // Fallback method with very simple query
    private async getSimpleNewsApiArticles(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            const baseUrl = this.getNewsApiUrl();
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            const params = new URLSearchParams({
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: '10',
                q: filters.category === 'ai' ? '"artificial intelligence"' : 'startup',
            });

            // Add API key only for localhost (direct NewsAPI calls)
            if (isLocalhost) {
                params.append('apiKey', this.NEWS_API_KEY);
            }

            let apiUrl;
            if (isLocalhost) {
                apiUrl = `${baseUrl}/everything`;
            } else {
                apiUrl = baseUrl;
            }

            const response = await axios.get(apiUrl, {
                params: Object.fromEntries(params),
                timeout: 5000,
            });

            return this.transformNewsApiResponse(response.data, filters);
        } catch (error) {
            console.error('Simple NewsAPI query also failed:', error);
            return [];
        }
    }

    // NewsAPI.ai - Advanced AI content analysis
    async getNewsAiArticles(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            const query: any = {
                action: 'getArticles',
                keyword: filters.category === 'ai' ? 'artificial intelligence' : 'startup',
                articlesPage: 1,
                articlesCount: 20,
                articlesSortBy: 'date',
                resultsType: 'articles',
                apiKey: this.NEWS_AI_API_KEY,
            };

            if (filters.region === 'india') {
                query['locationUri'] = 'http://en.wikipedia.org/wiki/India';
            }

            const response = await axios.post(this.BASE_URLS.newsAi + '/article/getArticles', query);
            return this.transformNewsAiResponse(response.data, filters);
        } catch (error) {
            console.error('NewsAI error:', error);
            return [];
        }
    }

    // NewsData.io - India-specific business/tech news
    async getNewsDataArticles(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            const params = new URLSearchParams({
                apikey: this.NEWS_DATA_API_KEY,
                language: 'en',
                size: '10',
            });

            if (filters.region === 'india') {
                params.append('country', 'in');
            }

            if (filters.category === 'ai') {
                params.append('category', 'technology');
                params.append('q', 'AI OR artificial intelligence');
            } else if (filters.category === 'startup') {
                params.append('category', 'business');
                params.append('q', 'startup OR funding');
            }

            const response = await axios.get(`${this.BASE_URLS.newsData}/news`, {
                params,
            });

            return this.transformNewsDataResponse(response.data, filters);
        } catch (error) {
            console.error('NewsData error:', error);
            return [];
        }
    }

    // Aggregate articles from multiple sources
    async getAggregatedNews(filters: NewsFilter): Promise<NewsArticle[]> {
        console.log('getAggregatedNews called with filters:', filters);

        // Create cache key based on filters
        const cacheKey = `${filters.category || 'all'}-${filters.region || 'all'}-${filters.timeRange || 'all'}`;

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            console.log('Returning cached data for:', cacheKey);
            return cached.data;
        }

        try {
            let allArticles: NewsArticle[] = [];

            // Get NewsAPI articles
            console.log('Fetching NewsAPI articles...');
            const newsApiArticles = await this.getNewsApiArticles(filters);
            console.log('NewsAPI articles received:', newsApiArticles.length);
            allArticles = allArticles.concat(newsApiArticles);

            // If filtering for India, add Indian-specific sources
            if (filters.region === 'india') {
                console.log('Skipping RSS feeds due to CORS issues - using NewsAPI only');
                // Temporarily disabled RSS feeds due to browser CORS restrictions
                // const indianArticles = await this.getIndianRSSNews(filters);
                // console.log('Indian RSS articles received:', indianArticles.length);
                // allArticles = allArticles.concat(indianArticles);
            }

            console.log('Total articles before deduplication:', allArticles.length);

            // If no articles from APIs, return empty array instead of mock data
            if (allArticles.length === 0) {
                console.log('No real articles found, returning empty array');
                return [];
            }

            // Remove duplicates and sort by date
            const uniqueArticles = this.removeDuplicates(allArticles);
            console.log('Final unique articles:', uniqueArticles.length);
            const sortedArticles = uniqueArticles.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

            // Cache the results
            this.cache.set(cacheKey, {
                data: sortedArticles,
                timestamp: Date.now()
            });

            return sortedArticles;
        } catch (error) {
            console.error('Error aggregating news:', error);
            return []; // Return empty array instead of mock articles
        }
    }

    // RSS Feed parser for Indian sources
    async getIndianRSSNews(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            const relevantFeeds: string[] = [];

            if (filters.category === 'ai') {
                relevantFeeds.push(
                    this.INDIAN_RSS_FEEDS.analytics_india,
                    this.INDIAN_RSS_FEEDS.et_tech,
                    this.INDIAN_RSS_FEEDS.livemint_tech
                    // Reduced to just 3 reliable feeds for AI
                );
            }

            if (filters.category === 'startup') {
                relevantFeeds.push(
                    this.INDIAN_RSS_FEEDS.inc42,
                    this.INDIAN_RSS_FEEDS.yourstory,
                    this.INDIAN_RSS_FEEDS.entrackr
                    // Reduced to just 3 reliable feeds for startups
                );
            }

            console.log(`Fetching ${relevantFeeds.length} Indian RSS feeds for ${filters.category}`);

            // Set overall timeout for RSS feeds - don't let them block the app
            const RSS_TIMEOUT = 10000; // 10 seconds max for all RSS feeds
            
            const rssPromise = this.fetchRSSFeedsWithTimeout(relevantFeeds, filters);
            
            try {
                const allRssArticles = await Promise.race([
                    rssPromise,
                    new Promise<NewsArticle[]>((_, reject) => 
                        setTimeout(() => reject(new Error('RSS timeout')), RSS_TIMEOUT)
                    )
                ]);
                
                console.log(`Total RSS articles collected: ${allRssArticles.length}`);
                return allRssArticles.slice(0, 5); // Limit to 5 articles max
                
            } catch (timeoutError) {
                console.warn('RSS feeds timed out, continuing without them:', timeoutError);
                return []; // Return empty array instead of hanging
            }

        } catch (error) {
            console.error('RSS fetch error:', error);
            return [];
        }
    }

    // Helper method to fetch RSS feeds with internal timeout
    private async fetchRSSFeedsWithTimeout(feeds: string[], filters: NewsFilter): Promise<NewsArticle[]> {
        const allRssArticles: NewsArticle[] = [];
        
        // Process feeds sequentially with short timeouts
        for (let i = 0; i < feeds.length && i < 3; i++) { // Max 3 feeds
            try {
                console.log(`Processing RSS feed ${i + 1} of ${Math.min(feeds.length, 3)}`);
                
                const feedPromise = this.fetchRSSFeedWithFallback(feeds[i], filters);
                const timeoutPromise = new Promise<NewsArticle[]>((_, reject) => 
                    setTimeout(() => reject(new Error('Feed timeout')), 3000) // 3 seconds per feed
                );
                
                const articles = await Promise.race([feedPromise, timeoutPromise]);
                
                if (articles.length > 0) {
                    console.log(`RSS feed ${i + 1} returned ${articles.length} articles`);
                    allRssArticles.push(...articles);
                }
                
            } catch (feedError) {
                console.warn(`RSS feed ${i + 1} failed or timed out:`, feedError instanceof Error ? feedError.message : feedError);
                // Continue with next feed
            }
            
            // Small delay between feeds
            if (i < feeds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        return allRssArticles;
    }

    // Fetch RSS feed with multiple fallback strategies - simplified for speed
    private async fetchRSSFeedWithFallback(feedUrl: string, filters: NewsFilter): Promise<NewsArticle[]> {
        // Try only the most reliable RSS-to-JSON service first
        try {
            console.log(`Trying RSS-to-JSON for: ${feedUrl}`);
            const articles = await this.tryRSSToJson(feedUrl, filters);
            if (articles.length > 0) {
                return articles;
            }
        } catch (error) {
            console.log('Primary RSS-to-JSON failed:', error instanceof Error ? error.message : error);
        }

        // Try one more alternative service if first fails
        try {
            const alternativeUrl = `https://rss-to-json-serverless-api.vercel.app/api?feedURL=${encodeURIComponent(feedUrl)}`;
            const response = await axios.get(alternativeUrl, {
                timeout: 2000, // Very short timeout
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.data) {
                const articles = this.parseAlternativeRSSJson(response.data, feedUrl, filters);
                if (articles.length > 0) {
                    console.log(`Success with alternative service: ${articles.length} articles`);
                    return articles;
                }
            }
        } catch (error) {
            console.log(`Alternative RSS service failed: ${error instanceof Error ? error.message : error}`);
        }

        return []; // Fail fast instead of trying many services
    }

    // Try primary RSS-to-JSON service
    private async tryRSSToJson(feedUrl: string, filters: NewsFilter): Promise<NewsArticle[]> {
        // Use the more reliable rss2json.com service
        const rssToJsonUrl = `https://rss2json.com/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=3`;

        const response = await axios.get(rssToJsonUrl, {
            timeout: 2000, // Reduced timeout for speed
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.data?.status === 'ok' && response.data.items) {
            return this.parseRSSJsonResponse(response.data, feedUrl, filters);
        }

        throw new Error('Invalid RSS-to-JSON response');
    }

    // Parse alternative RSS-to-JSON service responses
    private parseAlternativeRSSJson(data: any, feedUrl: string, filters: NewsFilter): NewsArticle[] {
        const articles: NewsArticle[] = [];
        const sourceName = this.getSourceNameFromUrl(feedUrl);

        // Different services have different response formats
        let items = data.items || data.entries || data.feed?.entries || [];

        console.log(`Processing ${items.length} items from alternative RSS service for ${sourceName}`);

        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];

            const title = item.title?.trim() || item.name?.trim();
            const link = item.link || item.url || item.guid || item.id;
            const description = item.description || item.content || item.summary || item.contentSnippet;
            const pubDate = item.pubDate || item.published || item.date || item.isoDate;
            const author = item.author || item.creator || item['dc:creator'];

            if (!title || !link) continue;

            // Filter relevance for Indian content
            if (!this.isRelevantIndianArticle(title, description || '', filters.category || 'ai')) {
                continue;
            }

            const cleanDescription = this.cleanHtmlTags(description || '');
            const publishedAt = this.parseDate(pubDate);

            articles.push({
                id: this.generateId(link),
                title: this.cleanHtmlTags(title),
                description: cleanDescription.substring(0, 200) + (cleanDescription.length > 200 ? '...' : ''),
                content: cleanDescription,
                url: link,
                urlToImage: this.getValidImageUrl(item.thumbnail || item.image || item.enclosure?.url, title, filters.category || 'ai'),
                publishedAt,
                source: {
                    id: sourceName.toLowerCase().replace(/\s+/g, '-'),
                    name: sourceName
                },
                author: author || 'Unknown Author',
                category: (filters.category === 'ai' || filters.category === 'startup') ? filters.category : 'ai',
                region: 'india',
                tags: this.extractTags(title + ' ' + cleanDescription),
                readTime: this.calculateReadTime(cleanDescription),
                isMockArticle: false
            });
        }

        return articles;
    }

    // Parse RSS JSON response from rss2json service
    private parseRSSJsonResponse(data: any, feedUrl: string, filters: NewsFilter): NewsArticle[] {
        const articles: NewsArticle[] = [];
        const sourceName = this.getSourceNameFromUrl(feedUrl);

        console.log(`Processing ${data.items?.length || 0} items from RSS-to-JSON for ${sourceName}`);

        const items = data.items || [];
        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];

            const title = item.title?.trim();
            const link = item.link || item.guid;
            const description = item.description || item.content || item.summary;
            const pubDate = item.pubDate || item.published;
            const author = item.author || item.creator;

            if (!title || !link) continue;

            // Filter relevance for Indian content
            if (!this.isRelevantIndianArticle(title, description || '', filters.category || 'ai')) {
                continue;
            }

            const cleanDescription = this.cleanHtmlTags(description || '');
            const publishedAt = this.parseDate(pubDate);

            articles.push({
                id: this.generateId(link),
                title: this.cleanHtmlTags(title),
                description: cleanDescription.substring(0, 200) + (cleanDescription.length > 200 ? '...' : ''),
                content: cleanDescription,
                url: link,
                urlToImage: this.getValidImageUrl(item.thumbnail || item.enclosure?.url, title, filters.category || 'ai'),
                publishedAt,
                source: {
                    id: sourceName.toLowerCase().replace(/\s+/g, '-'),
                    name: sourceName
                },
                author: author || 'Unknown Author',
                category: (filters.category === 'ai' || filters.category === 'startup') ? filters.category : 'ai',
                region: 'india',
                tags: this.extractTags(title + ' ' + cleanDescription),
                readTime: this.calculateReadTime(cleanDescription),
                isMockArticle: false
            });
        }

        console.log(`Successfully parsed ${articles.length} articles from RSS-to-JSON`);
        return articles;
    }

    // Parse date with fallback
    private parseDate(dateStr: string | null): string {
        if (!dateStr) return new Date().toISOString();

        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
        } catch {
            return new Date().toISOString();
        }
    }

    // Get source name from RSS feed URL
    private getSourceNameFromUrl(feedUrl: string): string {
        if (feedUrl.includes('economictimes')) return 'Economic Times';
        if (feedUrl.includes('livemint')) return 'LiveMint';
        if (feedUrl.includes('timesofindia')) return 'Times of India';
        if (feedUrl.includes('thehindu')) return 'The Hindu';
        if (feedUrl.includes('business-standard')) return 'Business Standard';
        if (feedUrl.includes('analyticsindiamag')) return 'Analytics India Magazine';
        if (feedUrl.includes('inc42')) return 'Inc42';
        if (feedUrl.includes('yourstory')) return 'YourStory';
        if (feedUrl.includes('entrackr')) return 'Entrackr';
        if (feedUrl.includes('vccircle')) return 'VCCircle';
        if (feedUrl.includes('medianama')) return 'MediaNama';
        if (feedUrl.includes('businesstoday')) return 'Business Today';
        if (feedUrl.includes('financialexpress')) return 'Financial Express';
        if (feedUrl.includes('news18')) return 'News18';
        if (feedUrl.includes('zeenews')) return 'Zee Business';
        return 'Indian Source';
    }

    // Clean HTML tags from content
    private cleanHtmlTags(text: string): string {
        return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    }

    // Check if article is relevant for Indian AI/Startup categories
    private isRelevantIndianArticle(title: string, description: string, category: string): boolean {
        const content = `${title} ${description}`.toLowerCase();

        if (category === 'ai') {
            const aiKeywords = [
                'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
                'neural network', 'chatgpt', 'openai', 'generative ai', 'automation',
                'robotics', 'algorithm', 'data science', 'analytics', 'tech', 'technology',
                'digital', 'innovation', 'software', 'platform', 'cloud', 'api'
            ];
            return aiKeywords.some(keyword => content.includes(keyword));
        }

        if (category === 'startup') {
            const startupKeywords = [
                'startup', 'funding', 'investment', 'venture', 'series', 'seed',
                'unicorn', 'valuation', 'ipo', 'acquisition', 'entrepreneur', 'founder',
                'fintech', 'saas', 'business', 'company', 'firm', 'raise', 'capital',
                'growth', 'expansion', 'launch', 'partnership'
            ];
            return startupKeywords.some(keyword => content.includes(keyword));
        }

        return true;
    }

    private transformNewsApiResponse(data: any, filters: NewsFilter): NewsArticle[] {
        console.log('NewsAPI raw response:', {
            status: data.status,
            totalResults: data.totalResults,
            articlesLength: data.articles?.length
        });

        if (!data.articles || data.articles.length === 0) {
            console.log('No articles in NewsAPI response');
            return [];
        }

        const transformedArticles = data.articles
            .filter((article: any) => this.isRelevantArticle(article, filters))
            .map((article: any) => ({
                id: this.generateId(article.url),
                title: article.title,
                description: article.description || '',
                content: article.content || '',
                url: article.url,
                urlToImage: this.getValidImageUrl(article.urlToImage, article.title || '', filters.category || 'ai'),
                publishedAt: article.publishedAt,
                source: {
                    id: article.source.id || 'unknown',
                    name: article.source.name || 'Unknown Source',
                },
                author: article.author || 'Unknown Author',
                category: filters.category || 'ai',
                region: filters.region || 'world',
                tags: this.extractTags(article.title + ' ' + article.description),
                readTime: this.calculateReadTime(article.content),
                isMockArticle: false, // Mark real articles as not mock
            }));

        console.log('Transformed articles count:', transformedArticles.length);
        return transformedArticles;
    }

    private transformNewsAiResponse(data: any, filters: NewsFilter): NewsArticle[] {
        return data.articles?.results?.map((article: any) => ({
            id: this.generateId(article.url),
            title: article.title,
            description: article.body?.substring(0, 200) + '...' || '',
            content: article.body || '',
            url: article.url,
            urlToImage: this.getValidImageUrl(article.image, article.title || '', filters.category || 'ai'),
            publishedAt: article.dateTime,
            source: {
                id: article.source.id || 'unknown',
                name: article.source.title || 'Unknown Source',
            },
            author: article.authors?.[0]?.name || 'Unknown Author',
            category: filters.category || 'ai',
            region: filters.region || 'world',
            tags: this.extractTags(article.title + ' ' + article.body),
            readTime: this.calculateReadTime(article.body),
        })) || [];
    }

    private transformNewsDataResponse(data: any, filters: NewsFilter): NewsArticle[] {
        return data.results?.map((article: any) => ({
            id: this.generateId(article.link),
            title: article.title,
            description: article.description || '',
            content: article.content || article.description || '',
            url: article.link,
            urlToImage: this.getValidImageUrl(article.image_url, article.title || '', filters.category || 'ai'),
            publishedAt: article.pubDate,
            source: {
                id: article.source_id || 'unknown',
                name: article.source_name || 'Unknown Source',
            },
            author: article.creator?.[0] || 'Unknown Author',
            category: filters.category || 'ai',
            region: filters.region || 'world',
            tags: article.keywords || this.extractTags(article.title + ' ' + article.description),
            readTime: this.calculateReadTime(article.content || article.description),
        })) || [];
    }

    private generateId(url: string): string {
        // Create a more unique ID by combining timestamp and URL hash
        const timestamp = Date.now().toString(36);
        const urlHash = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
        // Take more characters from the hash to ensure uniqueness
        const hashPart = urlHash.substring(0, 20);
        return `${timestamp}_${hashPart}`;
    }

    private extractTags(text: string): string[] {
        const keywords = ['AI', 'startup', 'funding', 'machine learning', 'technology', 'innovation', 'venture capital'];
        const foundTags: string[] = [];

        keywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                foundTags.push(keyword);
            }
        });

        return foundTags;
    }

    // Check if article is relevant to the requested category
    private isRelevantArticle(article: any, filters: NewsFilter): boolean {
        if (!article.title && !article.description) return false;

        const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
        
        // Filter out clearly irrelevant domains/sources for AI content
        const irrelevantDomains = [
            'onefootball.com',
            'espn.com',
            'goal.com',
            'skysports.com',
            'marca.com',
            'espnfc.com',
            'football365.com',
            'transfermarkt.com',
            'premierleague.com',
            'uefa.com',
            'fifa.com'
        ];

        // Check if article is from sports/irrelevant domains
        if (article.url && irrelevantDomains.some(domain => article.url.includes(domain))) {
            console.log('Filtering out irrelevant article from sports domain:', article.title);
            return false;
        }

        if (filters.category === 'ai') {
            // AI category - balanced keyword matching
            const aiKeywords = [
                'artificial intelligence', 'ai', 'machine learning', 'ml',
                'deep learning', 'neural network', 'chatgpt', 'openai',
                'generative ai', 'ai model', 'ai technology', 'automation',
                'robotics', 'algorithm', 'data science', 'computer vision',
                'natural language', 'gpt', 'llm', 'large language model'
            ];

            // Tech keywords that are AI-adjacent
            const techKeywords = [
                'technology', 'tech', 'software', 'digital', 'innovation',
                'microsoft', 'google', 'apple', 'meta', 'nvidia', 'tesla'
            ];

            // Check for AI keywords first
            const hasAiKeyword = aiKeywords.some(keyword =>
                content.includes(keyword.toLowerCase())
            );

            // If no direct AI keywords, check for tech keywords + context
            const hasTechKeyword = techKeywords.some(keyword =>
                content.includes(keyword.toLowerCase())
            );

            // Exclude sports-related content
            const sportsKeywords = [
                'football', 'soccer', 'madrid', 'barcelona', 'premier league',
                'champions league', 'fifa', 'uefa', 'goal', 'kit', 'jersey',
                'match', 'game', 'score', 'player', 'team', 'stadium'
            ];

            const isSports = sportsKeywords.some(keyword => content.includes(keyword));

            if (isSports) {
                return false;
            }

            // Accept if has AI keywords, or tech keywords with reasonable context
            return hasAiKeyword || (hasTechKeyword && content.length > 50);
        }

        if (filters.category === 'startup') {
            // Startup category - balanced keyword matching
            const startupKeywords = [
                'startup', 'venture capital', 'funding', 'investment',
                'series a', 'series b', 'series c', 'seed round',
                'unicorn', 'valuation', 'ipo', 'acquisition',
                'entrepreneur', 'founder', 'fintech', 'saas'
            ];

            // Business keywords that are startup-adjacent
            const businessKeywords = [
                'business', 'company', 'enterprise', 'innovation',
                'tech company', 'technology company', 'silicon valley'
            ];

            const hasStartupKeyword = startupKeywords.some(keyword => content.includes(keyword));
            const hasBusinessKeyword = businessKeywords.some(keyword => content.includes(keyword));

            // Accept if has startup keywords, or business keywords with reasonable context
            return hasStartupKeyword || (hasBusinessKeyword && content.length > 50);
        }

        // For other categories, allow all articles
        return true;
    }    private calculateReadTime(content: string): number {
        const wordsPerMinute = 200;
        const words = content.split(' ').length;
        return Math.ceil(words / wordsPerMinute);
    }

    private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
        const seen = new Set();
        const seenIds = new Set();
        return articles.filter(article => {
            const titleKey = article.title.toLowerCase().trim();
            const urlKey = article.url;

            // Check for duplicate titles or URLs
            if (seen.has(titleKey) || seen.has(urlKey) || seenIds.has(article.id)) {
                return false;
            }

            seen.add(titleKey);
            seen.add(urlKey);
            seenIds.add(article.id);
            return true;
        });
    }
}

export const newsService = new NewsService();
