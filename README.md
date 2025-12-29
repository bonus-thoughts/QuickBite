# QuickBite - Pattern Monitor

> 🚀 **[View Live Demo](https://quickbite-pattern.netlify.app)** | 📖 [Documentation](#setup-instructions) | 🐛 [Report Issues](https://github.com/bonus-thoughts/QuickBite/issues)

A geospatial intelligence application for visualizing and analyzing movement patterns using interactive mapping, AI-powered analysis, and Street View integration.

![Pattern Monitor Demo](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## Features

-  **Interactive Map Visualization** - Leaflet-based mapping with cluster detection
-  **AI-Powered Analysis** - Google Gemini integration for pattern recognition
-  **Street View Integration** - Embedded Google Maps Street View
-  **Pattern Detection** - Automatic identification of hotspots and routes
-  **Areas of Interest (AOI)** - Gap detection and dwell time analysis
-  **Day Filtering** - Temporal analysis across different time periods

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Mapping**: Leaflet.js with heat map support
- **AI**: Google Gemini API (2.5 Flash)
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Google Gemini API Key** - [Get one here](https://aistudio.google.com/apikey)
- **Google Maps API Key** - [Get one here](https://console.cloud.google.com/google/maps-apis/credentials)
  - Ensure "Maps Embed API" is enabled for Street View functionality

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/bonus-thoughts/QuickBite.git
cd QuickBite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API Keys

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your keys:

```env
# Gemini API Key for AI Analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps API Key for Street View Embed
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## How to Use

1. **Select a Day Filter** - Use the sidebar to filter by specific days or view all data
2. **Explore Clusters** - Click on map markers to view detected activity nodes
3. **View Street View** - Click "View Location" to open Google Street View
4. **Analyze Patterns** - The AI will provide insights on movement patterns and routines

## Deployment

### Live Demo
This project is deployed on Netlify: **[quickbite-pattern.netlify.app](https://quickbite-pattern.netlify.app)**

### Deploy Your Own

#### Netlify
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and import your repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify settings:
   - `GEMINI_API_KEY`
   - `GOOGLE_MAPS_API_KEY`

#### Vercel (Alternative)
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `GEMINI_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
4. Deploy!

## Project Structure

```
quickbite---pattern-monitor/
├── components/          # React components
│   ├── LeafletMap.tsx  # Main map component
│   ├── Sidebar.tsx     # Control panel
│   ├── HUD.tsx         # Heads-up display
│   └── StreetViewModal.tsx
├── services/           # API integrations
│   └── geminiService.ts
├── App.tsx            # Main app component
├── constants.ts       # Data and configuration
├── types.ts          # TypeScript definitions
└── vite.config.ts    # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects!

## Troubleshooting

### Street View not loading
- Verify your Google Maps API key has "Maps Embed API" enabled
- Check browser console for API errors

### AI Analysis failing
- Confirm your Gemini API key is valid and has quota remaining
- Check network connectivity

### Map not displaying
- Clear browser cache and reload
- Ensure `npm install` completed successfully

## Support

If you encounter any issues, please [open an issue](https://github.com/bonus-thoughts/QuickBite/issues) on GitHub.

---

Built with ❤️ using React, Leaflet, and Google Gemini AI
