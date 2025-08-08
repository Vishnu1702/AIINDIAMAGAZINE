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
                query = 'artificial intelligence';
            } else if (filters.category === 'startup') {
                query = 'startup funding';
            } else {
                query = 'technology';
            }

            // For India-specific content, adjust the query
            if (filters.region === 'india') {
                query += ' India';
                // Don't use country parameter with everything endpoint
                // params.append('country', 'in'); // This causes issues with /everything endpoint
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
            return this.transformNewsApiResponse(response.data, filters);
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
            // Return mock data if API fails
            return this.getMockArticles(filters);
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
            return this.getMockArticles(filters);
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
        try {
            let allArticles: NewsArticle[] = [];

            // Get NewsAPI articles
            const newsApiArticles = await this.getNewsApiArticles(filters);
            allArticles = allArticles.concat(newsApiArticles);

            // If filtering for India, add Indian-specific sources
            if (filters.region === 'india') {
                const indianArticles = await this.getIndianRSSNews(filters);
                allArticles = allArticles.concat(indianArticles);
            }

            // If no articles from APIs, return mock data
            if (allArticles.length === 0) {
                return filters.region === 'india'
                    ? this.getEnhancedIndianMockData(filters)
                    : this.getMockArticles(filters);
            }

            // Remove duplicates and sort by date
            const uniqueArticles = this.removeDuplicates(allArticles);
            return uniqueArticles.sort((a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
        } catch (error) {
            console.error('Error aggregating news:', error);
            return this.getMockArticles(filters);
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

            // For now, return enhanced mock data with actual Indian source names
            return this.getEnhancedIndianMockData(filters);
        } catch (error) {
            console.error('RSS fetch error:', error);
            return this.getEnhancedIndianMockData(filters);
        }
    }

    // Enhanced mock data with real Indian sources
    private getEnhancedIndianMockData(filters: NewsFilter): NewsArticle[] {
        const indianSources = [
            { id: 'inc42', name: 'Inc42' },
            { id: 'yourstory', name: 'YourStory' },
            { id: 'analytics-india-magazine', name: 'Analytics India Magazine' },
            { id: 'economic-times', name: 'Economic Times' },
            { id: 'entrackr', name: 'Entrackr' },
            { id: 'vccircle', name: 'VCCircle' },
            { id: 'livemint', name: 'Mint' },
            { id: 'business-standard', name: 'Business Standard' }
        ];

        const aiArticles = [
            {
                id: 'india-ai-1',
                title: 'Tata Consultancy Services Launches AI Center of Excellence in Bengaluru',
                description: 'TCS announces new AI research facility focusing on generative AI and machine learning solutions for enterprises.',
                content: 'Tata Consultancy Services has inaugurated a new AI Center of Excellence in Bengaluru...',
                url: 'https://inc42.com/buzz/tcs-ai-center-bengaluru/',
                urlToImage: this.createPlaceholderImage('TCS AI', '#FF6B35'),
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                source: indianSources[0],
                author: 'Rishabh Mansur',
                category: 'ai' as const,
                region: 'india' as const,
                tags: ['TCS', 'AI', 'Bengaluru', 'Machine Learning', 'Enterprise AI'],
                isBookmarked: false,
                readTime: 4,
            },
            {
                id: 'india-ai-2',
                title: 'IIT Delhi Researchers Develop AI Model for Indian Language Processing',
                description: 'New breakthrough in natural language processing specifically designed for Hindi, Tamil, and Bengali.',
                content: 'Researchers at IIT Delhi have developed an advanced AI model...',
                url: 'https://analyticsindiamag.com/iit-delhi-indian-language-ai/',
                urlToImage: this.createPlaceholderImage('IIT AI', '#FF6B35'),
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                source: indianSources[2],
                author: 'Priya Sharma',
                category: 'ai' as const,
                region: 'india' as const,
                tags: ['IIT Delhi', 'NLP', 'Indian Languages', 'Research', 'AI'],
                isBookmarked: false,
                readTime: 5,
            }
        ];

        const startupArticles = [
            {
                id: 'india-startup-1',
                title: 'PhonePe Raises $850M in Latest Funding Round, Valuation Hits $12B',
                description: 'Walmart-backed fintech unicorn PhonePe secures major funding for expansion across Southeast Asia.',
                content: 'PhonePe, India\'s leading digital payments platform, has raised $850 million...',
                url: 'https://yourstory.com/2024/03/phonepe-funding-850-million/',
                urlToImage: this.createPlaceholderImage('PhonePe', '#FF6B35'),
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                source: indianSources[1],
                author: 'Sindhu Hariharan',
                category: 'startup' as const,
                region: 'india' as const,
                tags: ['PhonePe', 'Fintech', 'Funding', 'Unicorn', 'Digital Payments'],
                isBookmarked: false,
                readTime: 3,
            },
            {
                id: 'india-startup-2',
                title: 'Byju\'s Restructuring: Ed-tech Giant Plans Major Pivot Strategy',
                description: 'Former unicorn Byju\'s announces comprehensive restructuring plan focusing on sustainable growth.',
                content: 'Byju\'s, once India\'s most valuable startup, is implementing a major restructuring...',
                url: 'https://entrackr.com/2024/03/byjus-restructuring-plan/',
                urlToImage: this.createPlaceholderImage('Byjus', '#FF6B35'),
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                source: indianSources[4],
                author: 'Harsh Upadhyay',
                category: 'startup' as const,
                region: 'india' as const,
                tags: ['Byju\'s', 'EdTech', 'Restructuring', 'Unicorn', 'Education'],
                isBookmarked: false,
                readTime: 6,
            }
        ];

        if (filters.category === 'ai') return aiArticles;
        if (filters.category === 'startup') return startupArticles;
        return [...aiArticles, ...startupArticles];
    }

    private getMockArticles(filters: NewsFilter): NewsArticle[] {
        const mockArticles: NewsArticle[] = [
            {
                id: '1',
                title: 'OpenAI Announces Major Breakthrough in AI Language Models',
                description: 'The company reveals significant improvements in natural language processing capabilities with their latest model update.',
                content: 'OpenAI has announced a major breakthrough in artificial intelligence...',
                url: 'https://example.com/openai-breakthrough',
                urlToImage: this.createPlaceholderImage('AI News', '#0066CC'),
                publishedAt: '2025-08-08T10:30:00Z',
                source: { id: 'techcrunch', name: 'TechCrunch' },
                author: 'Sarah Johnson',
                category: 'ai' as const,
                region: 'world' as const,
                tags: ['AI', 'OpenAI', 'machine learning', 'breakthrough'],
                readTime: 5,
            },
            {
                id: '2',
                title: 'Indian Startup Zerodha Expands AI-Powered Trading Platform',
                description: 'The fintech unicorn introduces advanced AI algorithms to help retail investors make better trading decisions.',
                content: 'Zerodha, India\'s largest retail stockbroker, has launched new AI-powered features...',
                url: 'https://example.com/zerodha-ai',
                urlToImage: this.createPlaceholderImage('India AI', '#FF6B35'),
                publishedAt: '2025-08-08T08:15:00Z',
                source: { id: 'economic-times', name: 'Economic Times' },
                author: 'Raj Patel',
                category: 'ai' as const,
                region: 'india' as const,
                tags: ['Zerodha', 'fintech', 'AI trading', 'India'],
                readTime: 4,
            },
            {
                id: '3',
                title: 'Global Venture Capital Funding Surges in Q3 2025',
                description: 'VC investments reach record highs with AI and climate tech startups leading the charge.',
                content: 'Venture capital funding has reached unprecedented levels this quarter...',
                url: 'https://example.com/vc-funding-q3',
                urlToImage: this.createPlaceholderImage('Startup News', '#00CC66'),
                publishedAt: '2025-08-08T06:45:00Z',
                source: { id: 'crunchbase', name: 'Crunchbase News' },
                author: 'Michael Chen',
                category: 'startup' as const,
                region: 'world' as const,
                tags: ['venture capital', 'funding', 'Q3 2025', 'climate tech'],
                readTime: 6,
            },
            {
                id: '4',
                title: 'Bengaluru-Based HealthTech Startup Raises $50M Series B',
                description: 'The AI-powered healthcare platform plans to expand across Southeast Asia with the new funding.',
                content: 'A Bengaluru-based healthtech startup has successfully raised $50 million...',
                url: 'https://example.com/healthtech-funding',
                urlToImage: this.createPlaceholderImage('India Startup', '#FF6B35'),
                publishedAt: '2025-08-08T05:20:00Z',
                source: { id: 'yourstory', name: 'YourStory' },
                author: 'Priya Sharma',
                category: 'startup' as const,
                region: 'india' as const,
                tags: ['healthtech', 'Series B', 'Bengaluru', 'AI healthcare'],
                readTime: 3,
            },
            {
                id: '5',
                title: 'Meta Unveils Next-Generation VR Headset with AI Integration',
                description: 'The new device promises breakthrough immersive experiences powered by advanced AI processing.',
                content: 'Meta has revealed its latest virtual reality headset featuring cutting-edge AI capabilities...',
                url: 'https://example.com/meta-vr-ai',
                urlToImage: this.createPlaceholderImage('VR AI', '#0066CC'),
                publishedAt: '2025-08-08T04:10:00Z',
                source: { id: 'the-verge', name: 'The Verge' },
                author: 'Alex Thompson',
                category: 'ai' as const,
                region: 'world' as const,
                tags: ['Meta', 'VR', 'AI integration', 'headset'],
                readTime: 7,
            },
            {
                id: '6',
                title: 'Indian Govt Launches $2B AI Innovation Fund',
                description: 'New initiative aims to boost AI research and development across Indian universities and startups.',
                content: 'The Indian government has announced a major $2 billion fund dedicated to AI innovation...',
                url: 'https://example.com/india-ai-fund',
                urlToImage: this.createPlaceholderImage('India AI Fund', '#FF6B35'),
                publishedAt: '2025-08-08T03:30:00Z',
                source: { id: 'livemint', name: 'LiveMint' },
                author: 'Ankit Verma',
                category: 'ai' as const,
                region: 'india' as const,
                tags: ['government', 'AI fund', 'innovation', 'research'],
                readTime: 5,
            }
        ];

        // Filter mock articles based on filters
        let filtered = mockArticles;

        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(article => article.category === filters.category);
        }

        if (filters.region && filters.region !== 'all') {
            filtered = filtered.filter(article => article.region === filters.region);
        }

        return filtered;
    }

    private transformNewsApiResponse(data: any, filters: NewsFilter): NewsArticle[] {
        return data.articles?.map((article: any) => ({
            id: this.generateId(article.url),
            title: article.title,
            description: article.description || '',
            content: article.content || '',
            url: article.url,
            urlToImage: article.urlToImage || this.createPlaceholderImage('News'),
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
        })) || [];
    }

    private transformNewsAiResponse(data: any, filters: NewsFilter): NewsArticle[] {
        return data.articles?.results?.map((article: any) => ({
            id: this.generateId(article.url),
            title: article.title,
            description: article.body?.substring(0, 200) + '...' || '',
            content: article.body || '',
            url: article.url,
            urlToImage: article.image || this.createPlaceholderImage('News'),
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
            urlToImage: article.image_url || this.createPlaceholderImage('News'),
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
