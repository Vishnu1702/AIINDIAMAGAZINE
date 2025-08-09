import { Mail, Heart, Globe, Users, Target, Zap } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-ai-blue to-startup-green rounded-xl p-8 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">About DesiAIMagazine</h1>
                <p className="text-xl text-blue-100">
                    Your trusted source for AI & Startup stories worldwide with dedicated focus on India
                </p>
            </div>

            {/* Mission */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Target className="mr-4 text-ai-blue" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    DesiAIMagazine is dedicated to bringing you the latest and most relevant stories from the rapidly evolving worlds of Artificial Intelligence and Startups. We believe that staying informed about technological advancements and entrepreneurial innovations is crucial in today's fast-paced digital landscape.
                </p>
            </div>

            {/* What We Do */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Zap className="mr-4 text-startup-green" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What We Do</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-ai-blue mb-3">🤖 AI Coverage</h3>
                        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                            <li>• Latest AI breakthroughs and research</li>
                            <li>• Machine learning innovations</li>
                            <li>• AI company updates and funding news</li>
                            <li>• Industry analysis and trends</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-startup-green mb-3">🚀 Startup Ecosystem</h3>
                        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                            <li>• Startup funding rounds and valuations</li>
                            <li>• Entrepreneur success stories</li>
                            <li>• Market trends and opportunities</li>
                            <li>• Innovation across industries</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Heart className="mr-4 text-india-orange" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose DesiAIMagazine?</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-ai-blue/10 dark:bg-ai-blue/20 p-4 rounded-lg mb-4">
                            <Globe className="mx-auto text-ai-blue" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Global Perspective</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Comprehensive coverage from worldwide sources with special focus on emerging markets
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="bg-startup-green/10 dark:bg-startup-green/20 p-4 rounded-lg mb-4">
                            <Users className="mx-auto text-startup-green" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Community Focused</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Dedicated sections for Indian AI and Startup ecosystem to support local innovation
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="bg-india-orange/10 dark:bg-india-orange/20 p-4 rounded-lg mb-4">
                            <Zap className="mx-auto text-india-orange" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Real-time Updates</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fresh content updated regularly from trusted news sources and industry publications
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Focus */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🇮🇳 Special Focus on India</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We recognize India's growing prominence in the global technology landscape. Our dedicated India sections highlight:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-india-orange/5 dark:bg-india-orange/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-india-orange mb-2">🤖 India AI</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            AI initiatives by Indian companies, government policies, research breakthroughs, and tech talent developments
                        </p>
                    </div>
                    <div className="bg-india-orange/5 dark:bg-india-orange/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-india-orange mb-2">🚀 India Startup</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Unicorn stories, funding news, entrepreneurial journeys, and the vibrant Indian startup ecosystem
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                    <Mail className="mr-4 text-ai-blue" size={32} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                </div>
                <div className="bg-gradient-to-r from-ai-blue/10 to-startup-green/10 dark:from-ai-blue/20 dark:to-startup-green/20 p-6 rounded-lg">
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                        Have questions, suggestions, or want to share a story tip? We'd love to hear from you!
                    </p>
                    <div className="flex items-center">
                        <Mail className="mr-3 text-ai-blue" size={20} />
                        <a
                            href="mailto:balivishnu.cs@gmail.com"
                            className="text-ai-blue hover:text-ai-blue/80 font-medium text-lg transition-colors"
                        >
                            balivishnu.cs@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    <strong>DesiAIMagazine</strong> - Bridging the gap between global innovation and local insights
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Stay informed. Stay ahead. Stay connected.
                </p>
            </div>
        </div>
    );
}
