# 🚀 Quick Setup Instructions

## Prerequisites
- Node.js 18+ installed
- pnpm package manager
- PostgreSQL database (or use Prisma Postgres)
- OpenRouter API key

## Step-by-Step Setup

### 1. Install Dependencies ✅
Already done! Packages installed:
- framer-motion
- axios
- prisma & @prisma/client
- cheerio
- puppeteer
- react-hot-toast
- lucide-react
- dotenv

### 2. Configure Environment Variables
Edit the `.env` file with your credentials:

```env
# Get OpenRouter API Key from: https://openrouter.ai/
OPENROUTER_API_KEY="your_actual_api_key_here"

# Database URL (already configured for Prisma Postgres)
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

# App URL (already configured)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important:** Replace `your_actual_api_key_here` with your real OpenRouter API key!

### 3. Set Up Database

Option A: Use Prisma Postgres (Recommended for development)
```bash
# In one terminal, start the database
npx prisma dev

# In another terminal, run migrations
npx prisma migrate dev --name init
npx prisma generate
```

Option B: Use your own PostgreSQL
```bash
# Update DATABASE_URL in .env with your connection string
# Example: postgresql://user:password@localhost:5432/roastfolio

# Then run migrations
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Server
```bash
pnpm dev
```

The app will be available at: http://localhost:3000

## 🎯 Testing the App

1. Open http://localhost:3000
2. Enter a portfolio URL (e.g., https://github.com/username)
3. Select a roast mode (Roast, Recruiter, or Brutal)
4. Click "Get Roasted"
5. Wait for AI analysis (15-30 seconds)
6. View your results!

## 🔧 Troubleshooting

### Puppeteer Issues on Linux
If screenshot capture fails, install these dependencies:
```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libgbm1 \
  libgtk-3-0 \
  libnss3 \
  libxss1 \
  xdg-utils
```

### Database Connection Issues
- Make sure Prisma Postgres is running: `npx prisma dev`
- Or verify your PostgreSQL server is running
- Check DATABASE_URL in `.env` is correct

### API Key Issues
- Verify your OpenRouter API key is valid
- Check you have credits/free tier available
- Make sure key is in `.env` without extra spaces or quotes

### Module Resolution Issues
If you get import errors:
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next
pnpm dev
```

## 📁 Key Files

- `app/page.tsx` - Landing page
- `app/result/page.js` - Results page
- `app/api/roast/route.js` - API endpoint
- `components/` - React components
- `lib/scraper.js` - Web scraping logic
- `lib/ai.js` - OpenRouter integration
- `prisma/schema.prisma` - Database schema

## 🎨 Features Implemented

✅ Modern landing page with animations
✅ Three roast modes (Roast, Recruiter, Brutal)
✅ Web scraping with Cheerio
✅ Screenshot capture with Puppeteer
✅ AI roasting with OpenRouter (trinity-mini)
✅ PostgreSQL database with Prisma ORM
✅ Result display with score and suggestions
✅ Copy and share functionality
✅ Loading skeletons
✅ Toast notifications
✅ Fully responsive design
✅ Dark mode theme

## 🔐 Security Notes

- Never commit `.env` file
- API keys are server-side only
- All scraping happens server-side
- Results are stored securely in database

## 📝 Next Steps

1. Get your OpenRouter API key
2. Update `.env` with the key
3. Start the database
4. Run migrations
5. Start the dev server
6. Test with your portfolio!

---

**Need help?** Check the main README.md for more details!
