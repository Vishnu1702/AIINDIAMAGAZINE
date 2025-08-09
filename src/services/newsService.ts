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

    private readonly BASE_URLS = {
        newsApi: 'https://newsapi.org/v2',
        newsAi: 'https://eventregistry.org/api/v1',
        newsData: 'https://newsdata.io/api/1',
    };

    // Create SVG placeholder images as data URIs
    private createPlaceholderImage(text: string, bgColor: string = '#0066CC'): string {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
            <rect width="400" height="200" fill="${bgColor}"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Smart image URL handling with fallbacks
    private getValidImageUrl(imageUrl: string | null | undefined, title: string, category: string): string {
        // If we have a valid image URL, return it
        if (imageUrl && this.isValidImageUrl(imageUrl)) {
            return imageUrl;
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

        // Check for common image extensions
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
        const hasImageExtension = imageExtensions.test(url);

        // Check for common image hosting patterns
        const imageHostPatterns = /(images?|media|cdn|static|assets|img)/i;
        const hasImageHost = imageHostPatterns.test(url);

        return hasImageExtension || hasImageHost || url.startsWith('data:image/');
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
            const params = new URLSearchParams({
                apiKey: this.NEWS_API_KEY,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: '20',
            });

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

            // For India-specific content, adjust the query
            if (filters.region === 'india') {
                query += ' India';
            }

            params.append('q', query);

            console.log('Fetching news with URL:', `${this.BASE_URLS.newsApi}/everything?${params.toString()}`);

            const response = await axios.get(`${this.BASE_URLS.newsApi}/everything`, {
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
            const params = new URLSearchParams({
                apiKey: this.NEWS_API_KEY,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: '10',
                q: filters.category === 'ai' ? '"artificial intelligence"' : 'startup',
            });

            const response = await axios.get(`${this.BASE_URLS.newsApi}/everything`, {
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
                console.log('Fetching Indian RSS articles...');
                const indianArticles = await this.getIndianRSSNews(filters);
                console.log('Indian RSS articles received:', indianArticles.length);
                allArticles = allArticles.concat(indianArticles);
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
                    this.INDIAN_RSS_FEEDS.livemint_tech,
                    this.INDIAN_RSS_FEEDS.times_tech,
                    this.INDIAN_RSS_FEEDS.hindu_sci_tech,
                    this.INDIAN_RSS_FEEDS.business_standard_tech
                );
            }

            if (filters.category === 'startup') {
                relevantFeeds.push(
                    this.INDIAN_RSS_FEEDS.inc42,
                    this.INDIAN_RSS_FEEDS.yourstory,
                    this.INDIAN_RSS_FEEDS.entrackr,
                    this.INDIAN_RSS_FEEDS.vccircle,
                    this.INDIAN_RSS_FEEDS.et_startups,
                    this.INDIAN_RSS_FEEDS.medianama,
                    this.INDIAN_RSS_FEEDS.livemint_companies
                );
            }

            console.log(`Fetching ${relevantFeeds.length} Indian RSS feeds for ${filters.category}`);

            // Fetch RSS feeds in parallel with timeout
            const rssPromises = relevantFeeds.map(feedUrl => 
                this.fetchRSSFeedWithFallback(feedUrl, filters)
            );

            const results = await Promise.allSettled(rssPromises);
            const allRssArticles: NewsArticle[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    console.log(`RSS feed ${index + 1} returned ${result.value.length} articles`);
                    allRssArticles.push(...result.value);
                } else if (result.status === 'rejected') {
                    console.warn(`RSS feed ${index + 1} failed:`, result.reason);
                }
            });

            console.log(`Total RSS articles collected: ${allRssArticles.length}`);
            return allRssArticles.slice(0, 10); // Limit to 10 articles per category

        } catch (error) {
            console.error('RSS fetch error:', error);
            return [];
        }
    }

    // Fetch RSS feed with multiple fallback strategies
    private async fetchRSSFeedWithFallback(feedUrl: string, filters: NewsFilter): Promise<NewsArticle[]> {
        // Try RSS parsing first
        let articles = await this.fetchRSSFeed(feedUrl, filters);
        if (articles.length > 0) {
            return articles;
        }

        // Try RSS-to-JSON service as fallback
        try {
            console.log(`Trying RSS-to-JSON fallback for: ${feedUrl}`);
            const rssToJsonUrl = `https://rss2json.com/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
            
            const response = await axios.get(rssToJsonUrl, {
                timeout: 6000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.data?.status === 'ok' && response.data.items) {
                return this.parseRSSJsonResponse(response.data, feedUrl, filters);
            }
        } catch (error) {
            console.log('RSS-to-JSON fallback failed:', error instanceof Error ? error.message : error);
        }

        return [];
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

    // Fetch and parse individual RSS feed
    private async fetchRSSFeed(feedUrl: string, filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            console.log(`Attempting to fetch RSS feed: ${feedUrl}`);
            
            // Try multiple CORS proxies
            const proxies = [
                `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
                `https://cors-anywhere.herokuapp.com/${feedUrl}`
            ];

            for (let i = 0; i < proxies.length; i++) {
                try {
                    const proxyUrl = proxies[i];
                    console.log(`Trying proxy ${i + 1}: ${proxyUrl.split('?')[0]}`);
                    
                    const response = await axios.get(proxyUrl, {
                        timeout: 8000, // 8 second timeout for RSS
                        headers: {
                            'Accept': 'application/json, application/xml, text/xml, */*'
                        }
                    });

                    let content = '';
                    
                    // Handle different proxy response formats
                    if (response.data?.contents) {
                        // allorigins.win format
                        content = response.data.contents;
                    } else if (typeof response.data === 'string') {
                        // Direct content or other proxy formats
                        content = response.data;
                    } else {
                        console.log(`Unexpected response format from proxy ${i + 1}:`, typeof response.data);
                        continue;
                    }

                    if (!content || content.trim().length === 0) {
                        console.log(`Empty content from proxy ${i + 1}`);
                        continue;
                    }

                    const articles = this.parseRSSContent(content, feedUrl, filters);
                    if (articles.length > 0) {
                        console.log(`Successfully parsed ${articles.length} articles using proxy ${i + 1}`);
                        return articles;
                    }
                    
                } catch (proxyError) {
                    console.log(`Proxy ${i + 1} failed:`, proxyError instanceof Error ? proxyError.message : proxyError);
                    continue;
                }
            }

            throw new Error('All proxies failed');

        } catch (error) {
            console.error(`Failed to fetch RSS from ${feedUrl}:`, error instanceof Error ? error.message : error);
            return [];
        }
    }

    // Parse RSS XML content
    private parseRSSContent(xmlContent: string, feedUrl: string, filters: NewsFilter): NewsArticle[] {
        try {
            // Clean and prepare XML content
            let cleanXml = xmlContent.trim();
            
            // Remove any BOM (Byte Order Mark) characters
            cleanXml = cleanXml.replace(/^\uFEFF/, '');
            
            // Check if content looks like XML
            if (!cleanXml.includes('<') || !cleanXml.includes('>')) {
                console.log('Content does not appear to be XML:', cleanXml.substring(0, 100));
                return [];
            }

            // Try to fix common XML issues
            cleanXml = cleanXml.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(cleanXml, 'application/xml');
            
            // Check for parsing errors more thoroughly
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError || xmlDoc.documentElement.tagName === 'parsererror') {
                console.log('XML parsing failed, trying as text/xml');
                // Try parsing as text/xml instead
                const xmlDoc2 = parser.parseFromString(cleanXml, 'text/xml');
                const parserError2 = xmlDoc2.querySelector('parsererror');
                if (parserError2) {
                    throw new Error(`XML parsing failed: ${parserError2.textContent}`);
                }
                return this.extractArticlesFromXml(xmlDoc2, feedUrl, filters);
            }

            return this.extractArticlesFromXml(xmlDoc, feedUrl, filters);
        } catch (error) {
            console.error('RSS parsing error:', error);
            console.log('Failed XML content (first 500 chars):', xmlContent.substring(0, 500));
            return [];
        }
    }

    // Extract articles from parsed XML document
    private extractArticlesFromXml(xmlDoc: Document, feedUrl: string, filters: NewsFilter): NewsArticle[] {
        const items = xmlDoc.querySelectorAll('item, entry'); // Support both RSS and Atom feeds
        const articles: NewsArticle[] = [];
        const sourceName = this.getSourceNameFromUrl(feedUrl);

        console.log(`Found ${items.length} items in RSS feed from ${sourceName}`);

        for (let i = 0; i < Math.min(items.length, 5); i++) { // Max 5 articles per feed
            const item = items[i];
            
            // Try different selectors for RSS vs Atom feeds
            const title = this.getTextContent(item, ['title']);
            const link = this.getTextContent(item, ['link', 'guid']) || 
                        item.querySelector('link')?.getAttribute('href');
            const description = this.getTextContent(item, ['description', 'summary', 'content']);
            const pubDate = this.getTextContent(item, ['pubDate', 'published', 'updated']);
            const author = this.getTextContent(item, ['author', 'dc:creator', 'creator']) ||
                          item.querySelector('author name')?.textContent?.trim();

            if (!title || !link) {
                console.log('Skipping item - missing title or link');
                continue;
            }

            // Filter relevance for Indian content
            if (!this.isRelevantIndianArticle(title, description || '', filters.category || 'ai')) {
                console.log('Skipping irrelevant article:', title.substring(0, 50));
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
                urlToImage: this.getValidImageUrl(null, title, filters.category || 'ai'),
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

        console.log(`Successfully parsed ${articles.length} articles from ${sourceName}`);
        return articles;
    }

    // Helper to get text content from multiple possible selectors
    private getTextContent(element: Element, selectors: string[]): string | null {
        for (const selector of selectors) {
            const found = element.querySelector(selector);
            if (found?.textContent?.trim()) {
                return found.textContent.trim();
            }
        }
        return null;
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
            console.log('No articles in NewsAPI response, falling back to mock data');
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
            // AI category - look for specific AI-related terms
            const aiKeywords = [
                'artificial intelligence',
                'machine learning',
                'deep learning',
                'neural network',
                'chatgpt',
                'openai',
                'generative ai',
                'ai model',
                'ai technology',
                'automation',
                'robotics',
                'algorithm'
            ];

            // Must contain at least one specific AI keyword
            const hasAiKeyword = aiKeywords.some(keyword => 
                content.includes(keyword) || content.includes(keyword.replace(' ', '-'))
            );

            // Exclude sports-related content even if it mentions AI
            const sportsKeywords = [
                'football', 'soccer', 'madrid', 'barcelona', 'premier league', 
                'champions league', 'fifa', 'uefa', 'goal', 'kit', 'jersey',
                'match', 'game', 'score', 'player', 'team', 'stadium'
            ];

            const isSports = sportsKeywords.some(keyword => content.includes(keyword));

            return hasAiKeyword && !isSports;
        }

        if (filters.category === 'startup') {
            // Startup category - look for business/funding related terms
            const startupKeywords = [
                'startup', 'venture capital', 'funding', 'investment',
                'series a', 'series b', 'series c', 'seed round',
                'unicorn', 'valuation', 'ipo', 'acquisition',
                'entrepreneur', 'founder', 'fintech', 'saas'
            ];

            return startupKeywords.some(keyword => content.includes(keyword));
        }

        // For other categories, allow all articles
        return true;
    }

    private calculateReadTime(content: string): number {
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
