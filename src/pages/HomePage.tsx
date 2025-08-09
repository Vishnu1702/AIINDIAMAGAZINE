import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Clock } from 'lucide-react';
import type { NewsSection, NewsArticle, UserPreferences } from '../types/news';
import { newsService } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface HomePageProps {
    sections: NewsSection[];
    preferences?: UserPreferences;
    onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

export default function HomePage({ sections, preferences, onUpdatePreferences }: HomePageProps) {
    const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
    const [sectionArticles, setSectionArticles] = useState<{ [key: string]: NewsArticle[] }>({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalArticles: 0,
        sourceFeeds: 0,
        lastUpdated: '',
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Load featured articles (AI & Startup news only)
            const aiArticles = await newsService.getAggregatedNews({
                category: 'ai',
                region: 'all',
                timeRange: 'today'
            });

            const startupArticles = await newsService.getAggregatedNews({
                category: 'startup',
                region: 'all',
                timeRange: 'today'
            });

            // Combine AI and Startup articles and sort by publishedAt
            const combinedArticles = [...aiArticles, ...startupArticles]
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .slice(0, 6);

            setFeaturedArticles(combinedArticles);

            // Load articles for each section
            const sectionData: { [key: string]: NewsArticle[] } = {};

            for (const section of sections) {
                const articles = await newsService.getAggregatedNews({
                    category: section.category,
                    region: section.region,
                    timeRange: 'today'
                });
                sectionData[section.id] = articles.slice(0, 3);
            }

            setSectionArticles(sectionData);

            // Update stats with real numbers
            const sectionArticleCount = Object.values(sectionData).flat().length;
            const totalArticles = combinedArticles.length + sectionArticleCount;

            // Honest metrics - real data only
            const sourceFeeds = 4; // NewsAPI.org, NewsAPI.ai, NewsData.io, RSS feeds
            const lastUpdated = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            setStats({
                totalArticles,
                sourceFeeds,
                lastUpdated
            });

        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Section - Compact */}
            <section className="bg-gradient-to-r from-ai-blue to-startup-green rounded-xl p-4 text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="text-center sm:text-left mb-3 sm:mb-0">
                            <h1 className="text-2xl font-bold mb-1">
                                Latest AI & Startup Stories
                            </h1>
                            <p className="text-sm text-blue-100">
                                Curated news worldwide with India focus
                            </p>
                        </div>
                        <div className="flex space-x-4 text-center text-sm">
                            <div>
                                <div className="text-lg font-bold">{stats.totalArticles}</div>
                                <div className="text-blue-200 text-xs">Fresh Articles</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold">{stats.sourceFeeds}</div>
                                <div className="text-blue-200 text-xs">News Sources</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold">{stats.lastUpdated}</div>
                                <div className="text-blue-200 text-xs">Last Updated</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="section-header">
                        <TrendingUp className="mr-2" size={24} />
                        Trending Now
                    </h2>
                    <Link
                        to="/search"
                        className="flex items-center text-ai-blue hover:text-ai-blue/80 font-medium"
                    >
                        View All <ChevronRight size={16} className="ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredArticles.map((article) => (
                        <NewsCard
                            key={article.id}
                            article={article}
                            preferences={preferences}
                            onUpdatePreferences={onUpdatePreferences}
                        />
                    ))}
                </div>
            </section>

            {/* Section Previews */}
            {sections.map((section) => (
                <section key={section.id}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-header">
                            <span className="mr-2 text-2xl">{section.icon}</span>
                            {section.title}
                        </h2>
                        <Link
                            to={`/section/${section.id}`}
                            className={`flex items-center font-medium hover:opacity-80 ${section.color === 'ai-blue' ? 'text-ai-blue' :
                                section.color === 'startup-green' ? 'text-startup-green' :
                                    section.color === 'india-orange' ? 'text-india-orange' :
                                        'text-gray-600'
                                }`}
                        >
                            View All <ChevronRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {sectionArticles[section.id]?.map((article) => (
                            <NewsCard
                                key={article.id}
                                article={article}
                                compact
                                preferences={preferences}
                                onUpdatePreferences={onUpdatePreferences}
                            />
                        )) || (
                                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                                    <Clock size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No articles available at the moment</p>
                                    <p className="text-sm">Check back later for updates</p>
                                </div>
                            )}
                    </div>
                </section>
            ))}
        </div>
    );
}
