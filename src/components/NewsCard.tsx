import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, Clock, Share2 } from 'lucide-react';
import type { NewsArticle, UserPreferences } from '../types/news';

interface NewsCardProps {
    article: NewsArticle;
    compact?: boolean;
    preferences?: UserPreferences;
    onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

export default function NewsCard({ article, compact = false, preferences, onUpdatePreferences }: NewsCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(() => {
        // Check if article is bookmarked in preferences
        if (preferences?.bookmarkedArticles) {
            return preferences.bookmarkedArticles.includes(article.id);
        }
        return article.isBookmarked || false;
    });
    const [imageError, setImageError] = useState(false);

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onUpdatePreferences && preferences) {
            // Use preferences system
            const currentBookmarks = preferences.bookmarkedArticles || [];
            let updatedBookmarks;

            if (isBookmarked) {
                // Remove from bookmarks
                updatedBookmarks = currentBookmarks.filter(id => id !== article.id);
            } else {
                // Add to bookmarks
                updatedBookmarks = [...currentBookmarks, article.id];

                // Also cache the article for retrieval on bookmarks page
                const cachedArticles = localStorage.getItem('cached-articles');
                let articles = cachedArticles ? JSON.parse(cachedArticles) : [];

                // Add or update the article in cache
                const existingIndex = articles.findIndex((a: NewsArticle) => a.id === article.id);
                if (existingIndex >= 0) {
                    articles[existingIndex] = { ...article, isBookmarked: true };
                } else {
                    articles.push({ ...article, isBookmarked: true });
                }

                localStorage.setItem('cached-articles', JSON.stringify(articles));
            }

            onUpdatePreferences({ bookmarkedArticles: updatedBookmarks });
        } else {
            // Fallback to old localStorage method if preferences not available
            const savedBookmarks = JSON.parse(localStorage.getItem('bookmarked-articles') || '[]');

            if (isBookmarked) {
                const filtered = savedBookmarks.filter((id: string) => id !== article.id);
                localStorage.setItem('bookmarked-articles', JSON.stringify(filtered));
            } else {
                savedBookmarks.push(article.id);
                localStorage.setItem('bookmarked-articles', JSON.stringify(savedBookmarks));
            }
        }

        setIsBookmarked(!isBookmarked);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description,
                url: article.url,
            });
        } else {
            // Fallback to copying URL
            navigator.clipboard.writeText(article.url);
            // You could show a toast notification here
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const getCategoryColor = () => {
        if (article.category === 'ai') return 'bg-ai-blue';
        if (article.category === 'startup') return 'bg-startup-green';
        return 'bg-gray-500';
    };

    const getRegionFlag = () => {
        if (article.region === 'india') return '🇮🇳';
        return '🌍';
    };

    return (
        <article className="news-card group cursor-pointer overflow-hidden" onClick={() => window.open(article.url, '_blank')}>
            {/* Image */}
            <div className="relative overflow-hidden">
                {!imageError && article.urlToImage ? (
                    <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="news-card-image group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="news-card-image bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-4xl opacity-50">📰</div>
                    </div>
                )}

                {/* Category badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor()}`}>
                    {article.category.toUpperCase()}
                </div>

                {/* Region indicator */}
                <div className="absolute top-3 right-3 text-lg">
                    {getRegionFlag()}
                </div>
            </div>

            {/* Content */}
            <div className="news-card-content">
                <h3 className={`news-card-title ${compact ? 'text-lg' : 'text-xl'}`}>
                    {article.title}
                </h3>

                {!compact && (
                    <p className="news-card-description">
                        {article.description}
                    </p>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Meta information */}
                <div className="news-card-meta">
                    <div className="flex items-center space-x-3 text-xs">
                        <span className="font-medium">{article.source.name}</span>
                        <span>•</span>
                        <span>{article.author}</span>
                        {article.readTime && (
                            <>
                                <span>•</span>
                                <div className="flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {article.readTime} min read
                                </div>
                            </>
                        )}
                    </div>
                    <div className="text-xs">
                        {formatDate(article.publishedAt)}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleBookmark}
                            className={`p-1.5 rounded-full transition-colors ${isBookmarked
                                ? 'text-ai-blue bg-blue-50 dark:bg-blue-900/20'
                                : 'text-gray-400 hover:text-ai-blue hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                        >
                            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>

                        <button
                            onClick={handleShare}
                            className="p-1.5 rounded-full text-gray-400 hover:text-startup-green hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                            <Share2 size={16} />
                        </button>
                    </div>

                    <button className="flex items-center text-xs text-gray-500 hover:text-ai-blue transition-colors">
                        <ExternalLink size={12} className="mr-1" />
                        Read More
                    </button>
                </div>
            </div>
        </article>
    );
}
