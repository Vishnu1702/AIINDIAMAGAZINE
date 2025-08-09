export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        id: string;
        name: string;
    };
    author: string;
    category: 'ai' | 'startup';
    region: 'world' | 'india';
    tags: string[];
    isBookmarked?: boolean;
    readTime?: number;
    biasScore?: number;
    isMockArticle?: boolean;
}

export interface NewsSection {
    id: string;
    title: string;
    icon: string;
    color: string;
    category: 'ai' | 'startup';
    region: 'world' | 'india';
    description: string;
}

export interface NewsFilter {
    category?: 'ai' | 'startup' | 'all';
    region?: 'world' | 'india' | 'all';
    timeRange?: 'today' | 'week' | 'month';
    source?: string;
    tags?: string[];
}

export interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    digestFrequency: 'daily' | 'weekly' | 'disabled';
    bookmarkedArticles: string[];
    readArticles: string[];
    preferredSources: string[];
}

export interface SearchState {
    query: string;
    filters: NewsFilter;
    isLoading: boolean;
    results: NewsArticle[];
    hasMore: boolean;
    page: number;
}
