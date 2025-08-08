import { Menu, Search, Bookmark, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
    darkMode: boolean;
    onThemeToggle: () => void;
}

export default function Header({ onMenuClick, darkMode, onThemeToggle }: HeaderProps) {
    const navigate = useNavigate();

    const handleBrandClick = () => {
        navigate('/');
    };

    const handleSearchClick = () => {
        navigate('/search');
    };

    const handleBookmarkClick = () => {
        navigate('/bookmarks');
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center ml-2 lg:ml-0">
                            <button
                                onClick={handleBrandClick}
                                className="text-2xl font-bold text-ai-blue dark:text-white hover:text-ai-blue/80 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            >
                                DesiAIMagazine
                            </button>
                        </div>
                    </div>

                    {/* Center - Search (hidden on mobile) */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search news, topics, sources..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ai-blue focus:border-transparent"
                                onFocus={handleSearchClick}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-2">
                        {/* Search icon for mobile */}
                        <button
                            onClick={handleSearchClick}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                        >
                            <Search size={20} />
                        </button>

                        {/* Bookmarks */}
                        <button
                            onClick={handleBookmarkClick}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Bookmark size={20} />
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={onThemeToggle}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notification indicator */}
                        <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-ai-blue to-startup-green rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">AI</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
