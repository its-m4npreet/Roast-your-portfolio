import { NextResponse } from 'next/server';
import { scrapePortfolio, captureScreenshot } from '@/lib/scraper';
import { generateRoast } from '@/lib/ai';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { url, mode = 'roast' } = await request.json();

    // Validate input
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ['roast', 'recruiter', 'brutal'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Choose from: roast, recruiter, brutal' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting analysis for ${url} in ${mode} mode`);

    // Step 1: Scrape portfolio
    console.log('[API] Scraping portfolio...');
    const portfolioData = await scrapePortfolio(url);

    // Step 2: Capture screenshot
    console.log('[API] Capturing screenshot...');
    let screenshot = null;
    try {
      screenshot = await captureScreenshot(url);
    } catch (error) {
      console.warn('[API] Screenshot capture failed:', error.message);
      // Continue without screenshot
    }

    // Step 3: Generate AI roast
    console.log('[API] Generating AI roast...');
    const aiResponse = await generateRoast(portfolioData, mode);

    // Step 4: Save to database
    console.log('[API] Saving to database...');
    let result;
    try {
      result = await prisma.roastResult.create({
        data: {
          url,
          score: aiResponse.score,
          roast: aiResponse.roast,
          suggestion: aiResponse.suggestion,
          mode,
          screenshot,
        },
      });
    } catch (dbError) {
      console.error('[API] Database error:', dbError.message);
      throw new Error(`Database error: ${dbError.message}. Please ensure Prisma dev server is running.`);
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
