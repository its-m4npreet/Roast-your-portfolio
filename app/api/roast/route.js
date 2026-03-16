import { NextResponse } from 'next/server';
import { scrapePortfolio, captureScreenshot, buildStructuredProfile } from '@/lib/scraper';
import { generateRoast } from '@/lib/ai';
import { prisma } from '@/lib/db';
import { validatePortfolioUrl } from '@/utils/helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function logScrapedJson(portfolioData, structuredProfile) {
  try {
    const summaryPayload = {
      scraped: {
        url: portfolioData?.url || '',
        title: portfolioData?.title || '',
        description: portfolioData?.description || '',
        headingsCount: (portfolioData?.headings || []).length,
        paragraphsCount: (portfolioData?.paragraphs || []).length,
        linksCount: (portfolioData?.links || []).length,
        imagesCount: (portfolioData?.images || []).length,
        projectsCount: (portfolioData?.projects || []).length,
        projectLinksCount: (portfolioData?.projectLinks || []).length,
        blogArticlesCount: (portfolioData?.blogArticles || []).length,
        socialLinksCount: (portfolioData?.socialLinks || []).length,
        crawledPagesCount: (portfolioData?.crawledPages || []).length,
        bodyTextSample: String(portfolioData?.bodyText || '').slice(0, 1200),
      },
      structuredProfile,
    };

    // Summary log
    console.log(`[API] Scraped JSON summary:\n${JSON.stringify(summaryPayload, null, 2)}`);

    // Full raw scraped object log (chunked to avoid terminal truncation)
    const rawJson = JSON.stringify(portfolioData, null, 2);
    logJsonInChunks('[API] Full raw scraped content JSON', rawJson);

    // Full structured profile log (chunked)
    const structuredJson = JSON.stringify(structuredProfile, null, 2);
    logJsonInChunks('[API] Full structured profile JSON', structuredJson);
  } catch (error) {
    console.warn('[API] Failed to log scraped JSON:', error?.message || error);
  }
}

function logJsonInChunks(label, jsonText, chunkSize = 4000) {
  if (!jsonText) {
    console.log(`${label}: {}`);
    return;
  }

  const total = Math.ceil(jsonText.length / chunkSize);
  for (let i = 0; i < total; i += 1) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = jsonText.slice(start, end);
    console.log(`${label} [part ${i + 1}/${total}]\n${chunk}`);
  }
}

function mapScrapeError(error) {
  const message = String(error?.message || 'Failed to scrape portfolio');
  const lower = message.toLowerCase();

  if (lower.includes('err_name_not_resolved') || lower.includes('enotfound')) {
    return {
      status: 400,
      code: 'DOMAIN_NOT_FOUND',
      error: 'Domain not found. Please check the URL spelling and try again.',
    };
  }

  if (lower.includes('econnrefused')) {
    return {
      status: 400,
      code: 'HOST_UNREACHABLE',
      error: 'Host refused the connection. The website may be down or blocked.',
    };
  }

  if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('navigation timeout')) {
    return {
      status: 504,
      code: 'REQUEST_TIMEOUT',
      error: 'The website took too long to respond. Please try again later.',
    };
  }

  if (lower.includes('err_cert') || lower.includes('certificate')) {
    return {
      status: 400,
      code: 'SSL_ERROR',
      error: 'Website SSL certificate is invalid or misconfigured.',
    };
  }

  return {
    status: 500,
    code: 'SCRAPE_FAILED',
    error: message,
  };
}

export async function POST(request) {
  try {
    const { url, mode = 'roast' } = await request.json();

    const validation = validatePortfolioUrl(url);

    // Validate input
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.reason,
          code: validation.code,
        },
        { status: 400 }
      );
    }

    const cleanUrl = validation.normalizedUrl;

    // Validate mode
    const validModes = ['roast', 'recruiter', 'brutal'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Choose from: roast, recruiter, brutal' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting analysis for ${cleanUrl} in ${mode} mode`);

    // Step 1: Scrape website content
    console.log('[API] Step 1: Scraping website content...');
    let portfolioData;
    try {
      portfolioData = await scrapePortfolio(cleanUrl);
    } catch (scrapeError) {
      const mapped = mapScrapeError(scrapeError);
      return NextResponse.json(
        {
          error: mapped.error,
          code: mapped.code,
        },
        { status: mapped.status }
      );
    }

    // Step 2: Convert extracted data to structured JSON profile
    console.log('[API] Step 2: Converting extracted data to structured profile JSON...');
    const structuredProfile = buildStructuredProfile(portfolioData);
    logScrapedJson(portfolioData, structuredProfile);

    // Step 3: Capture screenshot
    console.log('[API] Step 3: Capturing screenshot...');
    let screenshot = null;
    try {
      screenshot = await captureScreenshot(cleanUrl);
    } catch (error) {
      console.warn('[API] Screenshot capture failed:', error.message);
      // Continue without screenshot
    }

    // Step 4: Send structured profile to AI and generate roast
    console.log('[API] Step 4: Sending structured profile to AI...');
    const aiResponse = await generateRoast(portfolioData, mode, structuredProfile);

    // Step 4: Save to database
    console.log('[API] Saving to database...');
    let result;
    try {
      result = await prisma.roastResult.create({
        data: {
          url: cleanUrl,
          score: aiResponse.score,
          roast: aiResponse.roast,
          suggestion: aiResponse.suggestion,
          mode,
          screenshot,
        },
      });
    } catch (dbError) {
      console.error('[API] Database error:', dbError.message);
      throw new Error(
        `Database error: ${dbError.message}. Ensure Prisma migrations are applied (e.g. \"prisma migrate deploy\") and DATABASE_URL points to the correct database.`
      );
    }

    console.log('[API] Analysis complete:', result.id);

    return NextResponse.json({
      success: true,
      id: result.id,
      score: result.score,
      roast: result.roast,
      suggestion: result.suggestion,
      screenshot: result.screenshot,
      url: result.url,
      mode: result.mode,
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.error('[API] Error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze portfolio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await prisma.roastResult.findUnique({
      where: { id },
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error fetching result:', error);

    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    );
  }
}
