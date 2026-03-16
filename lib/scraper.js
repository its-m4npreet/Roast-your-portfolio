import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';

const MAX_HEADINGS = 80;
const MAX_IMAGES = 30;
const MAX_LINKS = 120;
const MAX_PARAGRAPHS = 120;
const MAX_BODY_TEXT = 30000;
const MAX_CRAWL_PAGES = 6;
const MAX_PROJECT_LINK_CHECKS = 12;

/**
 * Scrape portfolio website data using Puppeteer for dynamic content
 * @param {string} url - Portfolio URL
 * @returns {Promise<Object>} Scraped data
 */
export async function scrapePortfolio(url) {
  const validUrl = new URL(url);

  // First try dynamic scraping with Puppeteer
  try {
    const primaryData = await scrapeWithPuppeteer(validUrl.href);
    return await enrichWithInternalPages(primaryData, validUrl.href);
  } catch (error) {
    // If browser is unavailable in the current environment, gracefully fall back
    // to static HTML scraping so the roast can still be generated.
    if (isBrowserUnavailableError(error)) {
      console.warn('[Scraper] Puppeteer browser unavailable, using static fallback:', error.message);
      const primaryData = await scrapeStatic(validUrl.href);
      return await enrichWithInternalPages(primaryData, validUrl.href);
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

    // Many SPA portfolios show loader/skeleton first and hydrate content later.
    // Wait until meaningful content appears and loader is likely gone.
    await waitForMeaningfulContent(page);

    // Scroll to bottom to trigger lazy loading
    await autoScroll(page);

    // Allow post-scroll lazy sections to hydrate
    await waitForMeaningfulContent(page, { timeout: 10000, pollInterval: 500 });

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
    if (text && headings.length < MAX_HEADINGS) {
      headings.push(text);
    }
  });

  // Get all images (limit to 5)
  const images = [];
  $('img').each((i, elem) => {
    const src = $(elem).attr('src');
    const alt = $(elem).attr('alt') || '';
    if (src && images.length < MAX_IMAGES) {
      images.push({ src: normalizeHref(url, src), alt });
    }
  });

  // Get all links (limit to 10)
  const links = [];
  $('a').each((i, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().trim();
    const normalizedHref = normalizeHref(url, href);
    if (normalizedHref && links.length < MAX_LINKS) {
      links.push({ href: normalizedHref, text });
    }
  });

  // Get paragraphs (limit to 10 for more context)
  const paragraphs = [];
  $('p').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 20 && paragraphs.length < MAX_PARAGRAPHS) {
      paragraphs.push(text);
    }
  });

  // Try to extract tech stack tokens from badges, chips, and list items
  const technologies = extractTechnologies($);

  // Detect social links directly from anchors
  const socialLinks = extractSocialLinks(links);

  // Get all visible text content for better analysis
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  // Best-effort extraction of biography/about section
  const bio = extractBio(paragraphs, headings);

  // Best-effort extraction of experience snippets
  const experience = extractExperience(paragraphs, headings, bodyText);

  // Best-effort extraction of projects snippets
  const projects = extractProjects(paragraphs, headings, links);
  const projectLinks = extractProjectLinks(links, url);

  // Best-effort extraction of blog/articles
  const blogArticles = extractBlogArticles(paragraphs, headings, links);

  return {
    url,
    title: pageTitle,
    description: metaDescription,
    headings,
    images,
    links,
    paragraphs,
    bodyText: bodyText.substring(0, MAX_BODY_TEXT),
    technologies,
    techStack: technologies,
    socialLinks,
    bio,
    experience,
    projects,
    projectLinks,
    projectLinkHealth: [],
    blogArticles,
    hasBlogSection: blogArticles.length > 0,
    crawledPages: [],
  };
}

async function enrichWithInternalPages(primaryData, baseUrl) {
  const internalTargets = pickInternalPages(baseUrl, primaryData.links || []);

  if (internalTargets.length === 0) {
    return primaryData;
  }

  const crawledPages = [];

  for (const pageUrl of internalTargets) {
    try {
      const pageData = await scrapeStatic(pageUrl);
      crawledPages.push({
        url: pageUrl,
        title: pageData.title,
        description: pageData.description,
        headings: pageData.headings.slice(0, 15),
        links: (pageData.links || []).slice(0, 50),
        paragraphs: pageData.paragraphs.slice(0, 12),
        bodyText: pageData.bodyText.slice(0, 5000),
      });
    } catch (error) {
      console.warn(`[Scraper] Failed to crawl internal page ${pageUrl}:`, error.message);
    }
  }

  const mergedParagraphs = dedupeStrings([
    ...(primaryData.paragraphs || []),
    ...crawledPages.flatMap((p) => p.paragraphs || []),
  ]).slice(0, MAX_PARAGRAPHS);
  const mergedHeadings = dedupeStrings([
    ...(primaryData.headings || []),
    ...crawledPages.flatMap((p) => p.headings || []),
  ]).slice(0, MAX_HEADINGS);

  const mergedBodyText = [
    primaryData.bodyText || '',
    ...crawledPages.map((p) => p.bodyText || ''),
  ]
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_BODY_TEXT);

  const allSocial = extractSocialLinks([
    ...(primaryData.links || []),
    ...crawledPages.flatMap((p) => extractAnchorsFromPageBodyText(p.bodyText)),
  ]);

  const allTechnologies = dedupeStrings([
    ...(primaryData.technologies || []),
    ...extractTechnologiesFromText(mergedBodyText),
  ]);

  const projects = dedupeStrings([
    ...(primaryData.projects || []),
    ...extractProjects(mergedParagraphs, mergedHeadings, primaryData.links || []),
  ]).slice(0, 30);

  const mergedProjectLinks = dedupeProjectLinks([
    ...(primaryData.projectLinks || []),
    ...extractProjectLinks(primaryData.links || [], baseUrl),
    ...crawledPages.flatMap((p) => extractProjectLinks(p.links || [], baseUrl)),
  ]).slice(0, 40);

  const projectLinkHealth = await checkProjectLinksHealth(
    mergedProjectLinks.slice(0, MAX_PROJECT_LINK_CHECKS)
  );

  const experience = dedupeStrings([
    ...(primaryData.experience || []),
    ...extractExperience(mergedParagraphs, mergedHeadings, mergedBodyText),
  ]).slice(0, 30);

  const blogArticles = dedupeStrings([
    ...(primaryData.blogArticles || []),
    ...extractBlogArticles(mergedParagraphs, mergedHeadings, primaryData.links || []),
    ...crawledPages
      .filter((p) => /(blog|article|writing|post|newsletter|journal)/i.test(`${p.url} ${p.title} ${(p.headings || []).join(' ')}`))
      .map((p) => `${p.title} - ${p.url}`),
  ]).slice(0, 40);

  return {
    ...primaryData,
    headings: mergedHeadings,
    paragraphs: mergedParagraphs,
    bodyText: mergedBodyText,
    links: (primaryData.links || []).slice(0, MAX_LINKS),
    crawledPages,
    socialLinks: allSocial,
    technologies: allTechnologies,
    techStack: allTechnologies,
    projects,
    projectLinks: mergedProjectLinks,
    projectLinkHealth,
    experience,
    blogArticles,
    hasBlogSection: blogArticles.length > 0,
    bio: primaryData.bio || extractBio(mergedParagraphs, mergedHeadings),
  };
}

function pickInternalPages(baseUrl, links) {
  const base = new URL(baseUrl);
  const candidates = [];

  for (const link of links) {
    const href = typeof link === 'string' ? link : link?.href;
    const absolute = normalizeHref(baseUrl, href);
    if (!absolute) continue;

    try {
      const parsed = new URL(absolute);
      if (parsed.origin !== base.origin) continue;
      if (!isLikelyHtmlPage(parsed.pathname)) continue;
      if (parsed.hash) parsed.hash = '';
      parsed.search = '';
      candidates.push(parsed.toString());
    } catch {
      continue;
    }
  }

  const prioritized = dedupeStrings(candidates)
    .filter((u) => u !== base.toString())
    .sort((a, b) => scoreInternalPath(b) - scoreInternalPath(a));

  return prioritized.slice(0, MAX_CRAWL_PAGES);
}

function scoreInternalPath(url) {
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return '';
    }
  })();

  let score = 0;
  if (/(project|work|case-study|portfolio)/.test(path)) score += 6;
  if (/(about|bio|profile|intro)/.test(path)) score += 5;
  if (/(experience|career|resume|cv)/.test(path)) score += 5;
  if (/(skills|stack|tech|technology)/.test(path)) score += 4;
  if (/(blog|article|writing|post|newsletter|journal)/.test(path)) score += 6;
  if (/(contact|links)/.test(path)) score += 3;
  if (path.split('/').filter(Boolean).length <= 2) score += 2;
  return score;
}

function isLikelyHtmlPage(pathname = '') {
  const lower = pathname.toLowerCase();
  if (!lower || lower === '/') return true;
  if (lower.endsWith('/')) return true;
  return !/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|mp4|webm|mp3|json|xml|txt|css|js)$/i.test(lower);
}

function normalizeHref(baseUrl, href) {
  if (!href) return null;
  const trimmed = String(href).trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (/^(mailto:|tel:|javascript:)/i.test(trimmed)) return null;

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractTechnologies($) {
  const candidates = [];
  $('li, span, a, p, h3, h4, code').each((_, elem) => {
    const text = $(elem).text().replace(/\s+/g, ' ').trim();
    if (!text || text.length > 40) return;
    if (/^[a-z0-9.+#-]{2,30}$/i.test(text)) {
      candidates.push(text);
    }
  });

  const known = new Set(
    extractTechnologiesFromText(candidates.join(' ')).map((t) => t.toLowerCase())
  );

  return dedupeStrings(
    candidates.filter((c) => known.has(c.toLowerCase()))
  ).slice(0, 40);
}

function extractTechnologiesFromText(text = '') {
  const knownTech = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'NestJS',
    'Vue', 'Angular', 'Svelte', 'Tailwind CSS', 'CSS', 'HTML', 'Redux', 'Zustand',
    'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'C#', '.NET', 'Go',
    'Rust', 'PHP', 'Laravel', 'Ruby', 'Rails', 'MongoDB', 'PostgreSQL', 'MySQL',
    'SQLite', 'Prisma', 'Supabase', 'Firebase', 'GraphQL', 'REST API', 'Docker',
    'Kubernetes', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'GitHub', 'GitLab',
    'Jest', 'Cypress', 'Playwright', 'Figma', 'Framer Motion', 'Three.js', 'Webpack',
    'Vite', 'pnpm', 'npm', 'yarn'
  ];

  const lowered = ` ${String(text).toLowerCase()} `;
  const found = knownTech.filter((tech) => lowered.includes(` ${tech.toLowerCase()} `));
  return dedupeStrings(found);
}

function extractSocialLinks(links = []) {
  const socialDomains = [
    'github.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'medium.com',
    'dev.to',
    'youtube.com',
    'behance.net',
    'dribbble.com',
    'stackoverflow.com',
    'gitlab.com',
  ];

  const results = [];
  for (const link of links) {
    const href = typeof link === 'string' ? link : link?.href;
    if (!href) continue;
    const normalized = href.toLowerCase();
    if (socialDomains.some((d) => normalized.includes(d))) {
      results.push(href);
    }
  }

  return dedupeStrings(results);
}

function extractBio(paragraphs = [], headings = []) {
  const headingHasBio = headings.some((h) => /(about|bio|who i am|introduction|profile)/i.test(h));
  const matchedParagraphs = paragraphs.filter((p) => /\b(i am|i'm|developer|engineer|designer|building|passionate|experience)\b/i.test(p));

  if (headingHasBio && matchedParagraphs.length > 0) {
    return matchedParagraphs.slice(0, 4);
  }

  return matchedParagraphs.slice(0, 3);
}

function extractExperience(paragraphs = [], headings = [], bodyText = '') {
  const snippets = [
    ...paragraphs.filter((p) => /(experience|worked|engineer|developer|intern|company|years|role|responsible)/i.test(p)),
    ...headings.filter((h) => /(experience|work history|career|employment|resume|cv)/i.test(h)),
  ];

  if (snippets.length > 0) {
    return dedupeStrings(snippets).slice(0, 20);
  }

  const lines = String(bodyText).split(/(?<=[.!?])\s+/).filter((line) => /(experience|worked|role|company)/i.test(line));
  return dedupeStrings(lines).slice(0, 12);
}

function extractProjects(paragraphs = [], headings = [], links = []) {
  const projectText = [
    ...paragraphs.filter((p) => /(project|built|case study|demo|repository|github|product)/i.test(p)),
    ...headings.filter((h) => /(project|case study|featured work|portfolio)/i.test(h)),
    ...links
      .filter((l) => /(project|case-study|work|github|repo|demo)/i.test(l?.href || ''))
      .map((l) => `${l.text || 'Link'} - ${l.href}`),
  ];

  return dedupeStrings(projectText).slice(0, 30);
}

function extractProjectLinks(links = [], baseUrl = '') {
  const socialDomains = ['linkedin.com', 'twitter.com', 'x.com', 'instagram.com', 'facebook.com'];

  const candidates = links
    .map((l) => {
      const href = typeof l === 'string' ? l : l?.href;
      const text = typeof l === 'string' ? '' : (l?.text || '');
      if (!href) return null;

      const normalized = normalizeHref(baseUrl || href, href);
      if (!normalized) return null;
      const haystack = `${normalized} ${text}`.toLowerCase();

      const isSocial = socialDomains.some((d) => haystack.includes(d));
      if (isSocial) return null;

      const isProjectLike = /(project|case-study|case study|work|demo|repo|repository|github|gitlab|vercel|netlify|app\.|live|showcase|portfolio)/i.test(haystack);
      if (!isProjectLike) return null;

      const type = inferProjectLinkType(normalized, text);
      return { url: normalized, label: text.trim() || 'Project link', type };
    })
    .filter(Boolean);

  return dedupeProjectLinks(candidates);
}

function inferProjectLinkType(url, text = '') {
  const haystack = `${url} ${text}`.toLowerCase();
  if (/(github\.com|gitlab\.com|bitbucket\.org|repo|repository)/.test(haystack)) return 'repository';
  if (/(demo|live|vercel\.app|netlify\.app|render\.com|pages\.dev)/.test(haystack)) return 'live-demo';
  if (/(case-study|case study|project)/.test(haystack)) return 'case-study';
  return 'project-link';
}

async function checkProjectLinksHealth(projectLinks = []) {
  if (!projectLinks.length) return [];

  return mapWithConcurrency(projectLinks, 4, async (link) => {
    const result = await checkSingleLink(link.url);
    return {
      ...link,
      status: result.status,
      statusCode: result.statusCode,
      finalUrl: result.finalUrl,
      error: result.error,
    };
  });
}

async function checkSingleLink(url) {
  try {
    const head = await axios.head(url, {
      timeout: 7000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    // Some hosts block HEAD or return method-not-allowed, then fallback to GET.
    if ([405, 403, 501].includes(head.status)) {
      return await checkSingleLinkWithGet(url);
    }

    const status = classifyHttpStatus(head.status);
    return {
      status,
      statusCode: head.status,
      finalUrl: head.request?.res?.responseUrl || url,
      error: null,
    };
  } catch {
    return await checkSingleLinkWithGet(url);
  }
}

async function checkSingleLinkWithGet(url) {
  try {
    const response = await axios.get(url, {
      timeout: 9000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    return {
      status: classifyHttpStatus(response.status),
      statusCode: response.status,
      finalUrl: response.request?.res?.responseUrl || url,
      error: null,
    };
  } catch (error) {
    return {
      status: 'unknown',
      statusCode: null,
      finalUrl: url,
      error: String(error?.message || 'Request failed'),
    };
  }
}

function classifyHttpStatus(statusCode) {
  if (statusCode >= 200 && statusCode < 400) return 'working';
  if (statusCode >= 400) return 'broken';
  return 'unknown';
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = [];
  let index = 0;

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

function extractBlogArticles(paragraphs = [], headings = [], links = []) {
  const blogHeadingHits = headings.filter((h) => /(blog|article|writing|posts|newsletter|journal|insights)/i.test(h));

  const blogParagraphHits = paragraphs.filter((p) => {
    if (!/(blog|article|post|writing|published|read more|devlog|tutorial)/i.test(p)) return false;
    return p.length > 40;
  });

  const blogLinkHits = links
    .filter((l) => /(blog|article|post|writing|newsletter|journal|dev.to|medium\.com)/i.test(`${l?.href || ''} ${l?.text || ''}`))
    .map((l) => `${l.text || 'Article'} - ${l.href}`);

  return dedupeStrings([
    ...blogHeadingHits,
    ...blogParagraphHits,
    ...blogLinkHits,
  ]).slice(0, 40);
}

function extractUrlsFromText(text = '') {
  const matches = String(text).match(/https?:\/\/[^\s)]+/g) || [];
  return matches;
}

function extractAnchorsFromPageBodyText(text = '') {
  return extractUrlsFromText(text).map((href) => ({ href, text: '' }));
}

function dedupeStrings(values = []) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }

  return output;
}

function dedupeProjectLinks(values = []) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const url = String(value?.url || '').trim();
    if (!url) continue;
    const normalizedKey = url.toLowerCase();
    if (seen.has(normalizedKey)) continue;
    seen.add(normalizedKey);
    output.push({
      url,
      label: String(value?.label || 'Project link').trim(),
      type: value?.type || 'project-link',
    });
  }

  return output;
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

async function waitForMeaningfulContent(page, options = {}) {
  const timeout = options.timeout ?? 15000;
  const pollInterval = options.pollInterval ?? 700;
  const startedAt = Date.now();
  let stableChecks = 0;
  let previousTextLength = 0;

  while (Date.now() - startedAt < timeout) {
    const metrics = await page.evaluate(() => {
      const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
      const textLength = text.length;

      const headingCount = document.querySelectorAll('h1, h2, h3').length;
      const paragraphCount = document.querySelectorAll('p').length;
      const linkCount = document.querySelectorAll('a[href]').length;

      const loaderSelectors = [
        '[aria-busy="true"]',
        '[role="progressbar"]',
        '[class*="loading"]',
        '[class*="loader"]',
        '[class*="spinner"]',
        '[id*="loading"]',
        '#nprogress',
      ];

      const hasVisibleLoader = loaderSelectors.some((selector) => {
        const nodes = Array.from(document.querySelectorAll(selector));
        return nodes.some((node) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        });
      });

      return {
        textLength,
        headingCount,
        paragraphCount,
        linkCount,
        hasVisibleLoader,
      };
    });

    const hasMinimumContent =
      metrics.textLength > 900 ||
      metrics.headingCount >= 2 ||
      metrics.paragraphCount >= 3 ||
      metrics.linkCount >= 8;

    const growth = metrics.textLength - previousTextLength;
    const isStable = growth >= 0 && growth < 80;
    stableChecks = isStable ? stableChecks + 1 : 0;
    previousTextLength = metrics.textLength;

    // Require meaningful content and either no loader or stable content for a bit.
    if (hasMinimumContent && (!metrics.hasVisibleLoader || stableChecks >= 2)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
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

    await waitForMeaningfulContent(page);

    // Scroll to load all content
    await autoScroll(page);

    await waitForMeaningfulContent(page, { timeout: 10000, pollInterval: 500 });

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
