import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortAsc, RefreshCw } from 'lucide-react';
import type { NewsSection, NewsArticle, NewsFilter, UserPreferences } from '../types/news';
import { newsService } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface SectionPageProps {
    sections: NewsSection[];
    preferences?: UserPreferences;
    onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

export default function SectionPage({ sections, preferences, onUpdatePreferences }: SectionPageProps) {
    const { sectionId } = useParams<{ sectionId: string }>();
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<NewsFilter>({});
    const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');

    const section = sections.find(s => s.id === sectionId);

    useEffect(() => {
        if (section) {
            loadArticles(true);
        }
    }, [section, filters, sortBy]);

    const loadArticles = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setArticles([]);
        } else {
            setLoadingMore(true);
        }

        try {
            if (!section) return;

            const newsFilter: NewsFilter = {
                category: section.category,
                region: section.region,
                ...filters,
            };

            const newArticles = await newsService.getAggregatedNews(newsFilter);

            if (reset) {
                setArticles(newArticles);
            } else {
                setArticles(prev => [...prev, ...newArticles]);
            }

            setHasMore(newArticles.length > 0);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadArticles(false);
        }
    };

    const handleRefresh = () => {
        loadArticles(true);
    };

    const updateFilter = (key: keyof NewsFilter, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (!section) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Section not found</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">The requested section could not be found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-4xl mr-4">{section.icon}</span>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{section.description}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-ai-blue text-white rounded-lg hover:bg-ai-blue/90 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Filter size={18} className="mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                        </div>

                        {/* Time Range Filter */}
                        <select
                            value={filters.timeRange || 'today'}
                            onChange={(e) => updateFilter('timeRange', e.target.value as any)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <SortAsc size={18} className="mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                        >
                            <option value="date">Latest</option>
                            <option value="relevance">Relevance</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <NewsCard
                                key={article.id}
                                article={article}
                                preferences={preferences}
                                onUpdatePreferences={onUpdatePreferences}
                            />
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📰</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or check back later.</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && articles.length > 0 && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 bg-ai-blue text-white rounded-lg hover:bg-ai-blue/90 transition-colors disabled:opacity-50 flex items-center"
                            >
                                {loadingMore ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Articles'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
