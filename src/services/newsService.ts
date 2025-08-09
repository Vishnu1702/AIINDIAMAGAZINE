import axios from 'axios';
import type { NewsArticle, NewsFilter } from '../types/news';

class NewsService {
    private readonly NEWS_API_KEY = 'ff954d9cc07846abba3a0042abf89219'; // Get from newsapi.org
    private readonly NEWS_AI_API_KEY = import.meta.env.VITE_NEWS_AI_API_KEY || 'demo';
    private readonly NEWS_DATA_API_KEY = import.meta.env.VITE_NEWS_DATA_API_KEY || 'demo';

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
        et_tech: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
        inc42: 'https://inc42.com/feed/',
        yourstory: 'https://yourstory.com/feed',
        analytics_india: 'https://analyticsindiamag.com/feed/',
        business_standard: 'https://www.business-standard.com/rss/technology-106.rss',
        livemint_tech: 'https://www.livemint.com/rss/technology',
        entrackr: 'https://entrackr.com/feed/',
        vccircle: 'https://www.vccircle.com/feed/',
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

            // Build simpler query to avoid 400 errors
            let query = '';
            if (filters.category === 'ai') {
                query = 'artificial intelligence OR AI OR "machine learning"';
            } else if (filters.category === 'startup') {
                query = 'startup OR "venture capital" OR funding';
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
                timeout: 10000, // 10 second timeout
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
                q: filters.category === 'ai' ? 'AI' : 'startup',
            });

            const response = await axios.get(`${this.BASE_URLS.newsApi}/everything`, {
                params: Object.fromEntries(params),
                timeout: 10000,
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
            return uniqueArticles.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
        } catch (error) {
            console.error('Error aggregating news:', error);
            return []; // Return empty array instead of mock articles
        }
    }

    // RSS Feed parser for Indian sources
    async getIndianRSSNews(filters: NewsFilter): Promise<NewsArticle[]> {
        try {
            // Note: RSS parsing in browser requires CORS proxy
            // For production, implement server-side RSS parsing
            const relevantFeeds: string[] = [];

            if (filters.category === 'ai') {
                relevantFeeds.push(
                    this.INDIAN_RSS_FEEDS.analytics_india,
                    this.INDIAN_RSS_FEEDS.et_tech,
                    this.INDIAN_RSS_FEEDS.livemint_tech
                );
            }

            if (filters.category === 'startup') {
                relevantFeeds.push(
                    this.INDIAN_RSS_FEEDS.inc42,
                    this.INDIAN_RSS_FEEDS.yourstory,
                    this.INDIAN_RSS_FEEDS.entrackr,
                    this.INDIAN_RSS_FEEDS.vccircle
                );
            }

            // For now, return empty array instead of mock data
            return [];
        } catch (error) {
            console.error('RSS fetch error:', error);
            return [];
        }
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

        const transformedArticles = data.articles.map((article: any) => ({
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
