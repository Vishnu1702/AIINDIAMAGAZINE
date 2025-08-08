import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SectionPage from './pages/SectionPage';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import PolicyPage from './pages/PolicyPage';
import type { NewsSection, UserPreferences } from './types/news';
import './App.css';

const sections: NewsSection[] = [
  {
    id: 'india-ai',
    title: 'India AI',
    icon: '🇮🇳',
    color: 'india-orange',
    category: 'ai',
    region: 'india',
    description: 'AI innovation and developments in India'
  },
  {
    id: 'india-startup',
    title: 'India Startup',
    icon: '🏢',
    color: 'india-orange',
    category: 'startup',
    region: 'india',
    description: 'Indian startup ecosystem and funding news'
  },
  {
    id: 'world-ai',
    title: 'World AI',
    icon: '🤖',
    color: 'ai-blue',
    category: 'ai',
    region: 'world',
    description: 'Latest AI developments from around the globe'
  },
  {
    id: 'world-startup',
    title: 'World Startup',
    icon: '🚀',
    color: 'startup-green',
    category: 'startup',
    region: 'world',
    description: 'Global startup news and funding updates'
  }
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: true,
    digestFrequency: 'daily',
    bookmarkedArticles: [],
    readArticles: [],
    preferredSources: [],
  });

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('ai-news-preferences');
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      const initialDarkMode = parsed.theme === 'dark';
      setDarkMode(initialDarkMode);
    } else {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    // Apply theme to html element immediately
    const isDark = darkMode;

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#111827'; // gray-900
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb'; // gray-50
    }
  }, [darkMode]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('ai-news-preferences', JSON.stringify(newPreferences));

    if (updates.theme) {
      const newDarkMode = updates.theme === 'dark';
      setDarkMode(newDarkMode);
    }
  };

  return (
    <Router>
      <div className={`min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onThemeToggle={() => updatePreferences({ theme: darkMode ? 'light' : 'dark' })}
        />

        <div className="flex min-h-screen w-full">
          <Sidebar
            sections={sections}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''} pt-16 bg-gray-50 dark:bg-gray-900 w-full min-h-screen`}>
            <div className="min-h-full w-full px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<HomePage sections={sections} preferences={preferences} onUpdatePreferences={updatePreferences} />} />
                <Route path="/section/:sectionId" element={<SectionPage sections={sections} preferences={preferences} onUpdatePreferences={updatePreferences} />} />
                <Route path="/bookmarks" element={<BookmarksPage preferences={preferences} onUpdatePreferences={updatePreferences} />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/policy" element={<PolicyPage />} />
              </Routes>
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
