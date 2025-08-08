import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Tag } from 'lucide-react';
import type { NewsArticle, NewsFilter } from '../types/news';
import { newsService } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<NewsFilter>({
        category: 'all',
        region: 'all',
        timeRange: 'week',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recent-searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }

        // Load initial articles
        loadArticles();
    }, []);

    useEffect(() => {
        // Filter articles based on search query and filters
        filterArticles();
    }, [query, filters, articles]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const newsFilter: NewsFilter = {
                category: filters.category === 'all' ? undefined : filters.category,
                region: filters.region === 'all' ? undefined : filters.region,
                timeRange: filters.timeRange,
            };

            const results = await newsService.getAggregatedNews(newsFilter);
            setArticles(results);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterArticles = () => {
        let filtered = [...articles];

        // Text search
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                article.source.name.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredArticles(filtered);
    };

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);

        if (searchQuery.trim()) {
            // Add to recent searches
            const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
            setRecentSearches(updated);
            localStorage.setItem('recent-searches', JSON.stringify(updated));
        }
    };

    const handleFilterChange = (key: keyof NewsFilter, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            category: 'all',
            region: 'all',
            timeRange: 'week',
        });
    };

    const popularTags = useMemo(() => {
        const tagCount: { [key: string]: number } = {};
        articles.forEach(article => {
            article.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);
    }, [articles]);

    const handleTagClick = (tag: string) => {
        setQuery(tag);
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Search News</h1>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search articles, topics, sources..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ai-blue focus:border-transparent"
                    />
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Filter size={16} className="mr-2" />
                        Filters
                    </button>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredArticles.length} articles found
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category || 'all'}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="ai">AI</option>
                                    <option value="startup">Startup</option>
                                </select>
                            </div>

                            {/* Region Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Region
                                </label>
                                <select
                                    value={filters.region || 'all'}
                                    onChange={(e) => handleFilterChange('region', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                >
                                    <option value="all">All Regions</option>
                                    <option value="world">World</option>
                                    <option value="india">India</option>
                                </select>
                            </div>

                            {/* Time Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Time Range
                                </label>
                                <select
                                    value={filters.timeRange || 'week'}
                                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                >
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-ai-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Searches</h3>
                        <div className="space-y-2">
                            {recentSearches.slice(0, 5).map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => setQuery(search)}
                                    className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue transition-colors"
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Tags */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm lg:col-span-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Tag size={16} className="mr-2" />
                        Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag, index) => (
                            <button
                                key={index}
                                onClick={() => handleTagClick(tag)}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-ai-blue hover:text-white transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {query && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                Search results for: <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>

                    {filteredArticles.length === 0 && !loading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center">
                            <Search size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No results found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
