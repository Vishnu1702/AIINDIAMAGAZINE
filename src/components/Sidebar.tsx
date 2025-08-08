import { Link, useLocation } from 'react-router-dom';
import { X, Home, Search, Bookmark, Settings } from 'lucide-react';
import type { NewsSection } from '../types/news';

interface SidebarProps {
    sections: NewsSection[];
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ sections, isOpen, onClose }: SidebarProps) {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const getSectionIcon = (section: NewsSection) => {
        return section.icon;
    };

    const getSectionColorClass = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'ai-blue': 'text-ai-blue',
            'startup-green': 'text-startup-green',
            'india-orange': 'text-india-orange',
        };
        return colorMap[color] || 'text-gray-600';
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-700 lg:top-0 lg:h-screen lg:pt-16`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 lg:mt-8">
                    {/* Main Navigation */}
                    <div className="px-4 mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Navigation
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                                            ? 'bg-ai-blue text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Home size={18} className="mr-3" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/search"
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/search')
                                            ? 'bg-ai-blue text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Search size={18} className="mr-3" />
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bookmarks"
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/bookmarks')
                                            ? 'bg-ai-blue text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Bookmark size={18} className="mr-3" />
                                    Bookmarks
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* News Sections */}
                    <div className="px-4">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Sections
                        </h3>
                        <ul className="space-y-2">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <Link
                                        to={`/section/${section.id}`}
                                        onClick={onClose}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(`/section/${section.id}`)
                                                ? `bg-${section.color} text-white`
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <span className="mr-3 text-lg">{getSectionIcon(section)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium ${isActive(`/section/${section.id}`) ? 'text-white' : getSectionColorClass(section.color)}`}>
                                                {section.title}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Settings */}
                    <div className="px-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <ul className="space-y-2">
                            <li>
                                <button className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <Settings size={18} className="mr-3" />
                                    Settings
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </>
    );
}
