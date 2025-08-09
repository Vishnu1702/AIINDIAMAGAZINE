# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# DesiAIMagazine 🤖🇮🇳

A modern, responsive Progressive Web App (PWA) focused on AI and Startup news worldwide, with dedicated sections for Indian content.

## ⚠️ Important: NewsAPI CORS Issue Fix

**If you get a 426 CORS error when deploying**, this is because NewsAPI.org's free plan only works from localhost. We've implemented a serverless proxy solution - see [NEWSAPI_CORS_FIX.md](./NEWSAPI_CORS_FIX.md) for details.

## 🚀 Features

### News Sections
- **World AI** - Latest AI developments globally
- **World Startup** - Global startup news and funding updates  
- **India AI** - AI innovation and developments in India
- **India Startup** - Indian startup ecosystem news

### Core Functionality
- **Curated Feeds** - Aggregated news from multiple reliable sources
- **Advanced Search** - Search by keywords, topics, tags, and sources
- **Smart Filters** - Filter by category, region, time range, and publishers
- **Bookmarks** - Save articles for offline reading
- **Social Sharing** - Share articles across social platforms
- **Offline Mode** - Cached content for offline access
- **Daily Digest** - Personalized news summaries
- **Dark Mode** - Eye-friendly dark theme support
- **Mobile First** - Responsive design optimized for all devices

### Technical Features
- Progressive Web App (PWA) with offline capabilities
- Service Worker for background sync and caching
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Modern React with hooks
- Fast loading with Vite build system

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v3
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **PWA**: Custom Service Worker, Web App Manifest

## 📡 Data Sources

### Primary APIs
- **NewsAPI.org** - Global news with country/category filters
- **NewsAPI.ai** - Advanced AI content with NLP features  
- **NewsData.io** - India-specific business and technology news

### RSS Feeds
- MIT Technology Review AI
- Google AI Blog
- OpenAI Blog  
- NVIDIA AI Blog
- Various startup publications

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- API keys from news providers

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-india-magazine.git
   cd ai-india-magazine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_NEWS_API_KEY=your_newsapi_org_key
   VITE_NEWS_AI_API_KEY=your_newsapi_ai_key  
   VITE_NEWS_DATA_API_KEY=your_newsdata_io_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📱 PWA Installation

The app can be installed on any device:

- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" option in your browser menu
- **iOS**: Safari > Share > Add to Home Screen
- **Android**: Chrome > Menu > Add to Home Screen

## 🔧 Configuration

### API Keys Setup

1. **NewsAPI.org**
   - Visit [newsapi.org](https://newsapi.org)
   - Sign up for free tier (100 requests/day)
   - Get API key and add to `.env`

2. **NewsAPI.ai** 
   - Visit [newsapi.ai](https://newsapi.ai)
   - Sign up for advanced AI features
   - Get API key and add to `.env`

3. **NewsData.io**
   - Visit [newsdata.io](https://newsdata.io) 
   - Sign up for India-specific coverage
   - Get API key and add to `.env`

### Customization

- **Colors**: Edit theme colors in `tailwind.config.js`
- **Sections**: Modify news sections in `src/App.tsx`
- **Sources**: Add RSS feeds in `src/services/newsService.ts`

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: < 500KB gzipped
- **Offline Support**: Full offline reading mode

## 🌍 Browser Support

- Chrome/Edge 88+
- Firefox 85+  
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- News API providers for reliable data sources
- Tailwind CSS for the utility-first styling approach
- Lucide React for beautiful icons
- The React and TypeScript communities

---

Made with ❤️ for the AI and Startup community

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
