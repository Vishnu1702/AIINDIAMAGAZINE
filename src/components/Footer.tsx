import { Link } from 'react-router-dom';
import { Mail, Users, Shield, Heart } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            DesiAIMagazine
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                            Your trusted source for AI & Startup news worldwide with dedicated coverage for India's growing tech ecosystem. Stay informed about the latest innovations, funding rounds, and technological breakthroughs.
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Heart size={16} className="mr-2 text-red-500" />
                            Made with passion for the tech community
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/section/india-ai"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue dark:hover:text-ai-blue transition-colors"
                                >
                                    🇮🇳 India AI
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/section/india-startup"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-startup-green dark:hover:text-startup-green transition-colors"
                                >
                                    🚀 India Startup
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/section/world-ai"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue dark:hover:text-ai-blue transition-colors"
                                >
                                    🌍 World AI
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/section/world-startup"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-startup-green dark:hover:text-startup-green transition-colors"
                                >
                                    🌐 World Startup
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue dark:hover:text-ai-blue transition-colors flex items-center"
                                >
                                    <Users size={14} className="mr-2" />
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/policy"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue dark:hover:text-ai-blue transition-colors flex items-center"
                                >
                                    <Shield size={14} className="mr-2" />
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="mailto:balivishnu.cs@gmail.com"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-ai-blue dark:hover:text-ai-blue transition-colors flex items-center"
                                >
                                    <Mail size={14} className="mr-2" />
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            © {currentYear} DesiAIMagazine. All rights reserved.
                        </div>
                        <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
                            News aggregated from trusted sources worldwide
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
