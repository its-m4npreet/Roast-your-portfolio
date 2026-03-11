# 🔥 Roastfolio

Get your portfolio roasted by AI! Paste your portfolio URL and receive funny but useful feedback.

## ✨ Features

- 🎭 **Three Roasting Modes**
  - 😄 **Roast Mode**: Funny and entertaining feedback
  - 💼 **Recruiter Mode**: Professional evaluation from a recruiter perspective  
  - 💀 **Brutal Mode**: Savage, ruthless, no-holds-barred roasting

- 🤖 **AI-Powered Analysis**: Uses OpenRouter API with `arcee-ai/trinity-mini:free` model
- 📸 **Screenshot Capture**: Automatically captures portfolio screenshots using Puppeteer
- 🌐 **Web Scraping**: Analyzes portfolio content using Cheerio
- 💾 **Database Storage**: Saves roasts to PostgreSQL via Prisma ORM
- 🎨 **Beautiful UI**: Modern design with Framer Motion animations
- 📱 **Fully Responsive**: Works perfectly on all devices
- 🔔 **Toast Notifications**: Real-time feedback with React Hot Toast

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Scraping**: Cheerio + Puppeteer
- **AI**: OpenRouter API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd roastfolio
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Update the `.env` file with your credentials:

```env
# Database URL (Prisma Postgres or your own PostgreSQL)
DATABASE_URL="your_postgresql_connection_string"

# OpenRouter API Key
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get your OpenRouter API Key:**
- Visit https://openrouter.ai/
- Sign up for a free account
- Go to API Keys section
- Create a new API key
- Copy and paste it in the `.env` file

4. **Set up the database**

Start Prisma Postgres (or use your own PostgreSQL):
```bash
# For Prisma Postgres (runs locally)
npx prisma dev

# OR use your own PostgreSQL database
# Update DATABASE_URL in .env with your connection string
```

5. **Run database migrations**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. **Start the development server**
```bash
pnpm dev
```

7. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
roastfolio/
├── app/
│   ├── api/
│   │   └── roast/
│   │       └── route.js          # API endpoint for portfolio analysis
│   ├── result/
│   │   └── page.js                # Result display page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── loading.js                 # Loading state
│   └── page.tsx                   # Landing page
├── components/
│   ├── Hero.js                    # Hero section
│   ├── Navbar.js                  # Navigation bar
│   ├── RoastResultCard.js         # Result display card
│   ├── SkeletonCard.js            # Loading skeletons
│   └── UrlInput.js                # URL input form
├── lib/
│   ├── ai.js                      # OpenRouter AI integration
│   ├── db.js                      # Prisma database client
│   └── scraper.js                 # Web scraping utilities
├── utils/
│   └── helpers.js                 # Helper functions
├── prisma/
│   └── schema.prisma              # Database schema
├── .env                           # Environment variables
├── package.json
└── README.md
```

## 🚀 How It Works

1. **User Input**: User pastes their portfolio URL and selects a roast mode
2. **Web Scraping**: Cheerio extracts page title, meta description, headings, images, and links
3. **Screenshot**: Puppeteer captures a full-page screenshot
4. **AI Analysis**: OpenRouter API (trinity-mini) analyzes the data and generates:
   - A score from 0-100
   - Funny/professional roast comments
   - Actionable suggestions
5. **Save to Database**: Result is saved to PostgreSQL via Prisma
6. **Display Result**: User sees their score, roast, suggestions, and screenshot
7. **Share**: Users can copy roast or share on Twitter

## 🔒 Security

- API keys stored in `.env` (never exposed to frontend)
- `.gitignore` configured to exclude sensitive files
- Server-side API routes for sensitive operations

---

**Happy Roasting! 🔥**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
