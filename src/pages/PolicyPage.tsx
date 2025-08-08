import { Shield, Eye, Database, Share2, Users, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function PolicyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl p-8 text-white text-center">
                <Shield className="mx-auto mb-4 text-white" size={48} />
                <h1 className="text-4xl font-bold mb-4">Privacy Policy & Terms</h1>
                <p className="text-xl text-gray-200">
                    Transparency in how we collect, use, and share information
                </p>
            </div>

            {/* Content Aggregation Policy */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Database className="mr-4 text-ai-blue" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Content Aggregation Policy</h2>
                </div>
                <div className="space-y-4">
                    <div className="bg-ai-blue/5 dark:bg-ai-blue/10 p-6 rounded-lg border-l-4 border-ai-blue">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Content Sources</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            <strong>DesiAIMagazine</strong> operates as a content aggregation platform that collects, curates, and presents AI and Startup news from multiple trusted sources. We do not claim ownership of the original news content.
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Primary Sources Include:</h4>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• NewsAPI.org - Global news aggregation service</li>
                                <li>• NewsAPI.ai - AI-focused news with NLP features</li>
                                <li>• NewsData.io - Specialized in business and technology news</li>
                                <li>• RSS feeds from reputable AI and tech publications</li>
                                <li>• Verified startup and technology news sources</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Eye className="mr-4 text-startup-green" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How We Handle Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-startup-green mb-3">What We Collect</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <CheckCircle className="mr-2 mt-1 text-green-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">News articles from public APIs</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="mr-2 mt-1 text-green-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">User preferences (stored locally)</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="mr-2 mt-1 text-green-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">Bookmarked articles (local storage)</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-india-orange mb-3">What We Don't Collect</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <AlertCircle className="mr-2 mt-1 text-red-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">Personal identification information</span>
                            </div>
                            <div className="flex items-start">
                                <AlertCircle className="mr-2 mt-1 text-red-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">Email addresses or contact details</span>
                            </div>
                            <div className="flex items-start">
                                <AlertCircle className="mr-2 mt-1 text-red-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700 dark:text-gray-300">Location data or tracking cookies</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Usage and Sharing */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Share2 className="mr-4 text-ai-blue" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Data Usage & Sharing</h2>
                </div>
                <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">✅ What We Do</h3>
                        <ul className="text-green-700 dark:text-green-400 space-y-2">
                            <li>• Aggregate news from public sources and present them in organized sections</li>
                            <li>• Provide direct links to original articles with proper attribution</li>
                            <li>• Store user preferences locally on their device for better experience</li>
                            <li>• Enable offline reading through browser caching mechanisms</li>
                            <li>• Offer bookmarking and sharing features for user convenience</li>
                        </ul>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">❌ What We Don't Do</h3>
                        <ul className="text-red-700 dark:text-red-400 space-y-2">
                            <li>• Sell or share user data with third parties</li>
                            <li>• Track users across different websites</li>
                            <li>• Store personal information on our servers</li>
                            <li>• Claim ownership of original news content</li>
                            <li>• Modify or alter original article content</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Content Attribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <ExternalLink className="mr-4 text-startup-green" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Content Attribution & Copyright</h2>
                </div>
                <div className="space-y-4">
                    <div className="bg-startup-green/5 dark:bg-startup-green/10 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Commitment to Fair Use</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            We respect intellectual property rights and operate under fair use principles. All articles displayed on DesiAIMagazine include:
                        </p>
                        <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                            <li>• Clear attribution to the original source</li>
                            <li>• Direct links to the original articles</li>
                            <li>• Brief excerpts for preview purposes only</li>
                            <li>• Proper source logos and publication dates</li>
                            <li>• Immediate removal upon request from content owners</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* User Rights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Users className="mr-4 text-india-orange" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Rights & Controls</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">You Can:</h3>
                        <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                            <li>• Access all features without registration</li>
                            <li>• Control your local data and preferences</li>
                            <li>• Clear browser data anytime</li>
                            <li>• Share articles with proper attribution</li>
                            <li>• Contact us for any concerns</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">We Ensure:</h3>
                        <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                            <li>• No tracking or profiling</li>
                            <li>• Data stays on your device</li>
                            <li>• Transparent content sourcing</li>
                            <li>• Regular content updates</li>
                            <li>• Responsive customer support</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions or Concerns?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you have any questions about this policy, content attribution, or want to report any issues, please contact us:
                </p>
                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                    <div className="flex items-center">
                        <ExternalLink className="mr-3 text-ai-blue" size={20} />
                        <a 
                            href="mailto:balivishnu.cs@gmail.com" 
                            className="text-ai-blue hover:text-ai-blue/80 font-medium transition-colors"
                        >
                            balivishnu.cs@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>Last updated: August 2025</p>
                <p className="mt-2">This policy may be updated periodically to reflect changes in our practices.</p>
            </div>
        </div>
    );
}
