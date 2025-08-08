import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import type { UserPreferences, NewsArticle } from '../types/news';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface BookmarksPageProps {
    preferences: UserPreferences;
    onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

export default function BookmarksPage({ preferences, onUpdatePreferences }: BookmarksPageProps) {
    const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookmarkedArticles();
    }, [preferences]);

    const loadBookmarkedArticles = () => {
        setLoading(true);
        try {
            // Get bookmarked articles from preferences
            const bookmarkedIds = preferences.bookmarkedArticles || [];

            if (bookmarkedIds.length === 0) {
                setBookmarkedArticles([]);
                setLoading(false);
                return;
            }

            // In a real app, you'd fetch full article details from your API
            // For now, we'll get them from localStorage if available
            const savedArticles = localStorage.getItem('cached-articles');
            let cachedArticles: NewsArticle[] = [];

            if (savedArticles) {
                cachedArticles = JSON.parse(savedArticles);
            }

            // Filter cached articles to only show bookmarked ones
            const bookmarked = cachedArticles.filter(article =>
                bookmarkedIds.includes(article.id)
            );

            setBookmarkedArticles(bookmarked);
        } catch (error) {
            console.error('Error loading bookmarked articles:', error);
            setBookmarkedArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const clearAllBookmarks = () => {
        if (window.confirm('Are you sure you want to clear all bookmarks?')) {
            // Clear from preferences if update function is available
            if (onUpdatePreferences) {
                onUpdatePreferences({ bookmarkedArticles: [] });
            } else {
                // Fallback: update localStorage directly
                const savedPreferences = localStorage.getItem('ai-news-preferences');
                if (savedPreferences) {
                    const prefs = JSON.parse(savedPreferences);
                    prefs.bookmarkedArticles = [];
                    localStorage.setItem('ai-news-preferences', JSON.stringify(prefs));
                }
            }
            setBookmarkedArticles([]);
        }
    };

    const exportBookmarks = () => {
        const bookmarksData = {
            exportDate: new Date().toISOString(),
            articles: bookmarkedArticles.map(article => ({
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                tags: article.tags,
            })),
        };

        const blob = new Blob([JSON.stringify(bookmarksData, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-news-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Bookmark className="mr-3 text-ai-blue" size={32} />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmarks</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {bookmarkedArticles.length} saved article{bookmarkedArticles.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {bookmarkedArticles.length > 0 && (
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={exportBookmarks}
                                className="flex items-center px-4 py-2 bg-startup-green text-white rounded-lg hover:bg-startup-green/90 transition-colors"
                            >
                                <ExternalLink size={16} className="mr-2" />
                                Export
                            </button>

                            <button
                                onClick={clearAllBookmarks}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookmarked Articles */}
            {bookmarkedArticles.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center">
                    <Bookmark size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No bookmarks yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start bookmarking articles you want to read later by clicking the bookmark icon on any article.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-ai-blue text-white rounded-lg hover:bg-ai-blue/90 transition-colors"
                    >
                        Browse Articles
                    </button>
                </div>
            ) : (
                <>
                    {/* Filter/Sort Controls */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                                <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                    <option value="all">All Categories</option>
                                    <option value="ai">AI</option>
                                    <option value="startup">Startup</option>
                                </select>

                                <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                    <option value="all">All Regions</option>
                                    <option value="world">World</option>
                                    <option value="india">India</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                                <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title">Title A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarkedArticles.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
