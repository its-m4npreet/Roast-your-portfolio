import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'arcee-ai/trinity-large-preview:free';

/**
 * Generate AI roast based on portfolio data
 * @param {Object} portfolioData - Scraped portfolio data
 * @param {string} mode - Roast mode: 'roast', 'recruiter', or 'brutal'
 * @returns {Promise<Object>} AI generated response
 */
export async function generateRoast(portfolioData, mode = 'roast') {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.warn('⚠️  OPENROUTER_API_KEY is not configured. Please set it in your .env file.');
    console.warn('Get your API key from: https://openrouter.ai');
    throw new Error('OpenRouter API key is not configured. Please add your API key to the .env file.');
  }

  try {
    // Create prompt based on mode
    const prompt = createPrompt(portfolioData, mode);

    // Call OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(mode),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: mode === 'brutal' ? 1.0 : 0.8,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Roastfolio',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Parse the response to extract score, roast, and suggestions
    const parsed = parseAIResponse(aiResponse);

    return parsed;
  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate roast: ${error.message}`);
  }
}

/**
 * Get system prompt based on mode
 */
function getSystemPrompt(mode) {
  const prompts = {
    roast: 'You are a witty and humorous portfolio critic. Provide funny but constructive feedback on developer portfolios. Be entertaining but helpful.',
    recruiter: 'You are a professional tech recruiter reviewing portfolios. Provide detailed, professional feedback focused on improving job prospects.',
    brutal: 'You are a brutally honest portfolio critic. Hold nothing back. Be savage, ruthless, and hilariously harsh while still being somewhat constructive.',
  };

  return prompts[mode] || prompts.roast;
}

/**
 * Create prompt for AI based on portfolio data
 */
function createPrompt(data, mode) {
  const modeText = {
    roast: 'funny and entertaining roast',
    recruiter: 'professional recruiter evaluation',
    brutal: 'brutally savage roast',
  };

  const crawledPagesSummary = (data.crawledPages || [])
    .map((page, index) => {
      const snippet = (page.paragraphs || []).slice(0, 3).join(' | ');
      return `${index + 1}. ${page.url}\nTitle: ${page.title}\nHeadings: ${(page.headings || []).slice(0, 8).join(', ')}\nSnippets: ${snippet}`;
    })
    .join('\n\n');

  const projectSnippets = (data.projects || []).slice(0, 20).join('\n- ');
  const experienceSnippets = (data.experience || []).slice(0, 20).join('\n- ');
  const bioSnippets = (data.bio || []).slice(0, 8).join('\n- ');
  const blogSnippets = (data.blogArticles || []).slice(0, 20).join('\n- ');
  const techStack = (data.techStack || data.technologies || []).slice(0, 40).join(', ');
  const socialLinks = (data.socialLinks || []).slice(0, 20).join(', ');
  const projectLinks = (data.projectLinks || [])
    .slice(0, 30)
    .map((p, i) => `${i + 1}. [${p.type}] ${p.label} -> ${p.url}`)
    .join('\n');
  const projectLinkHealth = (data.projectLinkHealth || [])
    .slice(0, 30)
    .map((p, i) => `${i + 1}. ${p.url} | status=${p.status}${p.statusCode ? ` (${p.statusCode})` : ''}${p.error ? ` | error=${p.error}` : ''}`)
    .join('\n');
  const hasProjects = (data.projects || []).length > 0 || (data.projectLinks || []).length > 0;

  return `
Analyze this developer portfolio and provide a ${modeText[mode] || 'roast'}:

Portfolio URL: ${data.url}
Title: ${data.title}
Description: ${data.description}

Headings found: ${(data.headings || []).join(', ')}
Number of images: ${data.images.length}
Number of links: ${data.links.length}
Number of crawled internal pages: ${(data.crawledPages || []).length}

Technologies / Tech Stack detected:
${techStack || 'Not clearly detected'}

Social media / profile links detected:
${socialLinks || 'Not clearly detected'}

Bio/About snippets:
- ${bioSnippets || 'Not clearly detected'}

Experience snippets:
- ${experienceSnippets || 'Not clearly detected'}

Project snippets:
- ${projectSnippets || 'Not clearly detected'}

Project links detected:
${projectLinks || 'No explicit project links detected'}

Project link health checks:
${projectLinkHealth || 'No link checks available'}

Projects present in portfolio: ${hasProjects ? 'Yes' : 'No / Not clearly detected'}

Blog/Article snippets:
- ${blogSnippets || 'Not clearly detected'}

Blog section present: ${data.hasBlogSection ? 'Yes' : 'No / Not clearly detected'}

Content snippets:
${(data.paragraphs || []).slice(0, 20).join('\n')}

Internal pages analysis:
${crawledPagesSummary || 'No additional internal pages crawled'}

Full page text (trimmed):
${(data.bodyText || '').slice(0, 12000)}

Please provide your response in the following format:

SCORE: [0-100]
ROAST: [Your ${mode} feedback here - 2-3 paragraphs]
SUGGESTIONS: [3-5 actionable suggestions to improve the portfolio]

Important: Your analysis must explicitly cover all of these areas if information is available:
1) Bio/About
2) Projects/Case studies
  - Analyze each detected project/link individually (quality, clarity, credibility).
  - Mention broken links, redirects, or inaccessible links from health checks.
3) Experience
4) Technologies and tech stack
5) Social links and credibility signals
6) Blog/Articles/Writing section quality (if present)
7) Overall design/content quality

Critical instruction:
- If projects are present (Projects present in portfolio: Yes), DO NOT suggest "add projects".
- Instead, suggest how to improve existing projects (descriptions, outcomes, metrics, links, case studies, UX, performance).

Make it entertaining and memorable!
`.trim();
}

/**
 * Parse AI response to extract score, roast, and suggestions
 */
function parseAIResponse(response) {
  let score = 50; // Default score
  let roast = '';
  let suggestions = '';

  try {
    // Extract score
    const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
    if (scoreMatch) {
      score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    }

    // Extract roast
    const roastMatch = response.match(/ROAST:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/i);
    if (roastMatch) {
      roast = roastMatch[1].trim();
    }

    // Extract suggestions
    const suggestionsMatch = response.match(/SUGGESTIONS:\s*([\s\S]*?)$/i);
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].trim();
    }

    // Fallback: use entire response if parsing fails
    if (!roast && !suggestions) {
      const lines = response.split('\n');
      const middlePoint = Math.floor(lines.length / 2);
      roast = lines.slice(0, middlePoint).join('\n');
      suggestions = lines.slice(middlePoint).join('\n');
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
    roast = response;
    suggestions = 'Unable to parse suggestions. Try again!';
  }

  return {
    score,
    roast: roast || 'This portfolio is... interesting. Very interesting indeed.',
    suggestion: suggestions || 'Consider making it less interesting.',
  };
}
