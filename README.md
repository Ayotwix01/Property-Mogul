# My Contribution Hub

A modern real estate property browsing and management application built with React, TanStack Start, and TypeScript.

> **Live Demo:** https://gideonknight29-my-contribution-ll8hgiur4.vercel.app

## Overview

My Contribution Hub is a full-featured property discovery platform that allows users to browse listings, manage favorites, search by location and property type, and interact with an AI assistant for property recommendations.

## Features

- 🏠 **Property Browse** - Explore residential and commercial properties with advanced filtering
- ❤️ **Favorites Management** - Save your favorite listings for quick access
- 🔍 **Smart Search & Filters** - Filter by location, price, bedrooms, property type, and more
- 💬 **AI Chat Assistant** - Get property recommendations and answers to real estate questions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Easy on the eyes with built-in dark theme support
- ⚡ **Fast Performance** - Optimized loading with lazy image rendering and efficient routing

## Tech Stack

- **Frontend Framework**: React 19
- **Router**: TanStack Start
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **Build Tool**: Vite
- **Language**: JavaScript (converted from TypeScript)
- **AI Chat**: Integrated chatbot for property assistance

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/gideonknight29/my-contribution-hub.git
cd my-contribution-hub

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will start at `http://localhost:5173`

## Project Structure

```
src/
├── routes/            # File-based routing (TanStack Start convention)
│   ├── __root.jsx     # Root layout component
│   ├── index.jsx      # Home page
│   ├── browse.jsx     # Property browse page
│   └── ...
├── components/        # Reusable React components
├── lib/              # Utility functions and helpers
│   ├── utils.js      # Common utilities
│   └── chat.functions.js  # AI chat logic
├── styles/           # Global styles
└── server.js         # Server-side functions
```

## Key Pages

- **`/`** - Home page with featured properties and quick search
- **`/browse`** - Property listing with filters, search, and pagination
- **`/favorites`** - User's saved favorite properties
- **`/resources`** - Real estate resources and guides

## Recent Changes

- ✅ Converted entire codebase from TypeScript to JavaScript
- ✅ Removed TypeScript dependencies while maintaining full functionality
- ✅ Updated build configuration for JavaScript projects
- ✅ All React components, routing, and features remain fully operational

## Development

### Build for Production

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Lint Code

```bash
pnpm lint
```

## Deployment

This project is deployed on [Vercel](https://vercel.com). Any push to the `main` branch automatically triggers a production deployment.

**Production URL**: https://gideonknight29-my-contribution-ll8hgiur4.vercel.app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions, please open an issue in the repository.

---

Built with ❤️ using React and TanStack Start
