<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# DesiAIMagazine - News Application

This is a modern React TypeScript PWA focused on AI and Startup news worldwide with dedicated sections for Indian content.

## Project Structure
- Uses React 18 with TypeScript and Vite
- Tailwind CSS v3 for styling with custom color scheme
- News API integrations (NewsAPI.org, NewsAPI.ai, NewsData.io)
- PWA capabilities with service worker and offline caching
- Responsive design optimized for mobile-first approach

## Key Features
- Four main sections: World AI, World Startup, India AI, India Startup
- Search functionality with filters and tags
- Bookmark/save articles locally
- Share articles to social media
- Daily digest notifications
- Offline reading with cached content
- Source transparency and bias indicators

## Technical Guidelines
- Use functional components with React hooks
- Implement proper TypeScript interfaces for all data structures
- Follow responsive design principles with Tailwind CSS
- Use Axios for API calls with proper error handling
- Implement proper loading states and error boundaries
- Use localStorage for offline bookmarks and preferences
- Include proper SEO meta tags and PWA manifest

## API Integration
- Primary: NewsAPI.org for general news with country/category filters
- Secondary: NewsAPI.ai for AI-specific content with NLP features
- Tertiary: NewsData.io for India-specific business/tech news
- RSS feeds for specialized AI publications

## Color Scheme
- AI Blue: #0066CC for AI-related content
- Startup Green: #00CC66 for startup-related content  
- India Orange: #FF6B35 for India-specific content
- Standard Tailwind colors for UI elements
