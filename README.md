# Property Mogul

A full-featured real estate property discovery platform built with React and TanStack Start. Browse listings, manage favorites, search by location and property type, and get AI-powered property recommendations.

## Overview

Property Mogul lets users explore residential and commercial properties with advanced filtering, save favorites, view property details, and interact with an AI assistant for personalized recommendations. Built for the Nigerian real estate market with a modern, responsive UI.

## Features

- 🏠 **Property Browse** — Explore residential and commercial properties with advanced filtering and pagination
- ❤️ **Favorites Management** — Save and manage your favorite listings
- 🔍 **Smart Search & Filters** — Filter by location, price range, bedrooms, property type, and sort options
- 💬 **AI Chat Assistant** — Get property recommendations and answers to real estate questions
- 📱 **Responsive Design** — Seamless experience on desktop, tablet, and mobile
- 🌙 **Dark Mode** — Built-in dark theme support with system preference detection
- ⚡ **Fast Performance** — Optimized with lazy image loading, skeleton screens, and efficient routing
- 🗺️ **Owner & Seeker Dashboards** — Role-based views for property owners and seekers

## Tech Stack

- **Frontend**: React 19
- **Router**: TanStack Start (file-based routing)
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui components
- **Build Tool**: Vite
- **Language**: JavaScript (JSX)
- **Icons**: Material Symbols
- **Form Validation**: Zod + TanStack Zod Adapter

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm, yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/gideonknight29/my-contribution-hub.git
cd my-contribution-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at `http://localhost:5173`

## Project Structure

```
src/
├── routes/             # File-based routes (TanStack Start convention)
│   ├── __root.jsx      # Root layout with error/not-found boundaries
│   ├── index.jsx       # Home / landing page
│   ├── browse.jsx      # Property browse with filters & pagination
│   ├── favorites.jsx   # Saved properties
│   ├── login.jsx       # Sign in page
│   ├── signup.jsx      # Registration page
│   ├── seeker.jsx      # Seeker dashboard
│   ├── owner.jsx       # Owner dashboard
│   ├── property.$id.jsx # Property detail view
│   ├── resources.jsx   # Real estate guides & resources
│   └── role-select.jsx # Role selection flow
├── components/         # Reusable UI components (shadcn/ui based)
│   ├── ai-chat-widget.jsx  # AI assistant chat interface
│   ├── skeleton.jsx        # Loading skeletons
│   ├── theme-toggle.jsx    # Dark/light mode toggle
│   └── ui/                 # shadcn/ui component primitives
├── hooks/              # Custom React hooks
│   ├── use-auth.js
│   └── use-mobile.jsx
├── lib/                # Utilities and helpers
│   ├── chat.functions.js   # AI chat logic
│   ├── error-capture.js    # Client-side error handling
│   ├── error-page.js       # Error page renderer
│   ├── properties.js       # Property data and utilities
│   └── utils.js            # Common helper functions
└── server.js           # Server entry with SSR error handling
```

## Key Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with featured properties and quick search |
| `/browse` | Browse | Full property listing with filters, sort, and pagination |
| `/favorites` | Favorites | User's saved property collection |
| `/property/:id` | Property Detail | Full property details, images, specs, and contact |
| `/seeker` | Seeker Dashboard | Personalized dashboard for property seekers |
| `/owner` | Owner Dashboard | Dashboard for property owners to manage listings |
| `/resources` | Resources | Real estate guides, articles, and market insights |
| `/login` | Login | Sign in to existing account |
| `/signup` | Sign Up | Create a new account |
| `/role-select` | Role Select | Choose between owner/seeker flow |

## Building for Production

```bash
npm run build
```

Output is in the `.output` directory, ready for deployment to any Node.js hosting (Vercel, Netlify, etc.).

## Deployment

The project is configured for Vercel deployment via `vercel.json`. Push to the `main` branch to trigger automatic production deployment.

## License

MIT — see LICENSE for details.

---

Built with React, TanStack Start, and Tailwind CSS.

