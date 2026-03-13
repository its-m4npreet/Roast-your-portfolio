import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';

/**
 * Scrape portfolio website data using Puppeteer for dynamic content
 * @param {string} url - Portfolio URL
 * @returns {Promise<Object>} Scraped data
 */
export async function scrapePortfolio(url) {
  const validUrl = new URL(url);

  // First try dynamic scraping with Puppeteer
  try {
    return await scrapeWithPuppeteer(validUrl.href);
  } catch (error) {
    // If browser is unavailable in the current environment, gracefully fall back
    // to static HTML scraping so the roast can still be generated.
    if (isBrowserUnavailableError(error)) {
      console.warn('[Scraper] Puppeteer browser unavailable, using static fallback:', error.message);
      return await scrapeStatic(validUrl.href);
    }

    throw new Error(`Failed to scrape portfolio: ${error.message}`);
  }
}

async function scrapeWithPuppeteer(url) {
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Scroll to bottom to trigger lazy loading
    await autoScroll(page);

    // Wait a bit for any animations/lazy loading
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the full HTML content after JavaScript execution
    const html = await page.content();
    return extractFromHtml(url, html);
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function scrapeStatic(url) {
  const response = await axios.get(url, {
    timeout: 30000,
    maxRedirects: 5,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  return extractFromHtml(url, response.data);
}

function extractFromHtml(url, html) {
  // Load HTML into Cheerio
  const $ = cheerio.load(html);

  // Extract data
  const pageTitle = $('title').text() || 'No title';
  const metaDescription = $('meta[name="description"]').attr('content') || 'No description';

  // Get all headings
  const headings = [];
  $('h1, h2, h3').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text && headings.length < 10) {
      headings.push(text);
    }
  });

  // Get all images (limit to 5)
  const images = [];
  $('img').each((i, elem) => {
    const src = $(elem).attr('src');
    const alt = $(elem).attr('alt') || '';
    if (src && images.length < 5) {
      images.push({ src, alt });
    }
  });

  // Get all links (limit to 10)
  const links = [];
  $('a').each((i, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().trim();
    if (href && links.length < 10) {
      links.push({ href, text });
    }
  });

  // Get paragraphs (limit to 10 for more context)
  const paragraphs = [];
  $('p').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 20 && paragraphs.length < 10) {
      paragraphs.push(text);
    }
  });

  // Get all visible text content for better analysis
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    url,
    title: pageTitle,
    description: metaDescription,
    headings,
    images,
    links,
    paragraphs,
    bodyText: bodyText.substring(0, 5000), // Limit to 5000 chars
  };
}

function isBrowserUnavailableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('could not find chrome') ||
    message.includes('could not find chromium') ||
    message.includes('browser was not found') ||
    message.includes('failed to launch the browser process')
  );
}

/**
 * Auto-scroll function to trigger lazy loading
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Capture screenshot of portfolio website
 * @param {string} url - Portfolio URL
 * @returns {Promise<string>} Base64 encoded screenshot
 */
export async function captureScreenshot(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Scroll to load all content
    await autoScroll(page);

    // Scroll back to top for screenshot
    await page.evaluate(() => window.scrollTo(0, 0));

    // Wait a bit for animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture full page screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80,
      fullPage: true,
    });

    await browser.close();

    // Convert to base64
    return screenshot.toString('base64');
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Failed to capture screenshot: ${error.message}`);
  }
}
