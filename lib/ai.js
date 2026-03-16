import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'arcee-ai/trinity-large-preview:free';

/**
 * Generate AI roast based on portfolio data
 * @param {Object} portfolioData - Scraped portfolio data
 * @param {string} mode - Roast mode: 'roast', 'recruiter', or 'brutal'
 * @returns {Promise<Object>} AI generated response
 */
export async function generateRoast(portfolioData, mode = 'roast', structuredProfileInput = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.warn('⚠️  OPENROUTER_API_KEY is not configured. Please set it in your .env file.');
    console.warn('Get your API key from: https://openrouter.ai');
    throw new Error('OpenRouter API key is not configured. Please add your API key to the .env file.');
  }

  try {
    // Create prompt based on mode
    const prompt = createPrompt(portfolioData, mode, structuredProfileInput);

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
    roast: 'You are DevRoast AI — an intelligent but sarcastic developer critic. Be funny, evidence-based, and constructive. No hate, no slurs, no personal attacks.',
    recruiter: 'You are DevRoast AI in recruiter mode. Be professional, evidence-based, and direct. Keep humor subtle but present.',
    brutal: 'You are DevRoast AI in brutal mode. Be savage but still grounded in evidence. No fabricated claims and no hateful content.',
  };

  return prompts[mode] || prompts.roast;
}

/**
 * Create prompt for AI based on portfolio data
 */
function createPrompt(data, mode, structuredProfileInput) {
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
  const structuredProfile =
    structuredProfileInput && typeof structuredProfileInput === 'object'
      ? structuredProfileInput
      : buildProfileDataObject(data);

  const profileData = stringifyProfileData(structuredProfile);

  return `
You are DevRoast AI — an intelligent but sarcastic developer critic.

Task: Analyze this developer's entire online presence and generate a ${modeText[mode] || 'roast'} based only on real evidence.

IMPORTANT RULES:
- Carefully analyze ALL provided information before roasting.
- Do not invent facts.
- Only roast based on given data.
- If something important is missing, roast that humorously.
- Mention specific projects/articles/designs when they exist.
- If portfolio is impressive, give a clever roast (not lazy insults).
- If projects are present, DO NOT suggest "add projects".

STEP 1 — PROFILE ANALYSIS
Check:
1. Developer Level (Beginner/Intermediate/Advanced)
2. Tech Stack (languages/frameworks/tools)
3. Projects (count, originality, complexity, tutorial-patterns)
4. GitHub Activity (repos, standout work, quality indicators)
5. Articles/Blogs (topics, repetition, depth, frequency)
6. Posts/Social Content (patterns/tone)
7. Design Work (UI originality, Dribbble/Behance/Figma if present)
8. Portfolio Quality (clarity, template smell, buzzwords, over-animation)
9. Funny patterns ("passionate developer", "coffee lover", etc.)

STEP 2 — SHORT SUMMARY
Return:
Developer Level:
Tech Stack:
Project Quality:
Writing Quality:
Design Quality:
Portfolio Uniqueness:
Funny Observations:

STEP 3 — ROAST
Generate a cohesive roast in 1-2 short paragraphs (not bullet points).
Mention stack/projects/blog/design/social patterns if present.
Keep tone funny and sarcastic, not hateful.

OUTPUT FORMAT (STRICT):
SCORE: [0-100]
ANALYSIS:
- Developer Level:
- Tech Stack:
- Project Quality:
- Writing Quality:
- Design Quality:
- Portfolio Uniqueness:
- Funny Observations:

ROAST:
[Write 1-2 short roast paragraphs in plain text. No bullets, no numbering]

SUGGESTIONS:
- 3 to 5 actionable suggestions based on evidence only

PROFILE DATA:
${profileData}

Extra extracted context:
Portfolio URL: ${data.url}
Title: ${data.title}
Description: ${data.description}
Headings found: ${(data.headings || []).join(', ')}
Number of images: ${data.images.length}
Number of links: ${data.links.length}
Number of crawled internal pages: ${(data.crawledPages || []).length}
Technologies / Tech Stack detected: ${techStack || 'Not clearly detected'}
Social media / profile links detected: ${socialLinks || 'Not clearly detected'}
Bio/About snippets: ${bioSnippets || 'Not clearly detected'}
Experience snippets: ${experienceSnippets || 'Not clearly detected'}
Project snippets: ${projectSnippets || 'Not clearly detected'}
Project links detected: ${projectLinks || 'No explicit project links detected'}
Project link health checks: ${projectLinkHealth || 'No link checks available'}
Projects present in portfolio: ${hasProjects ? 'Yes' : 'No / Not clearly detected'}
Blog/Article snippets: ${blogSnippets || 'Not clearly detected'}
Blog section present: ${data.hasBlogSection ? 'Yes' : 'No / Not clearly detected'}
Internal pages analysis: ${crawledPagesSummary || 'No additional internal pages crawled'}
Full page text (trimmed): ${(data.bodyText || '').slice(0, 12000)}
`.trim();
}

function buildProfileDataObject(data = {}) {
  const safe = (value, max = 30) => (Array.isArray(value) ? value.slice(0, max) : []);

  return {
    profile: {
      url: data.url,
      title: data.title,
      description: data.description,
      bio: safe(data.bio, 10),
      experience: safe(data.experience, 30),
      technologies: safe(data.technologies || data.techStack, 60),
      socialLinks: safe(data.socialLinks, 30),
      designLinks: safe((data.links || []).filter((l) => /dribbble\.com|behance\.net|figma\.com/i.test(l.href)), 20),
    },
    projects: {
      snippets: safe(data.projects, 40),
      links: safe(data.projectLinks, 40),
      linkHealth: safe(data.projectLinkHealth, 40),
    },
    github: {
      repositoryLinks: safe((data.projectLinks || []).filter((p) => /github\.com|gitlab\.com|bitbucket\.org/i.test(p.url)), 30),
    },
    writing: {
      hasBlogSection: Boolean(data.hasBlogSection),
      blogArticles: safe(data.blogArticles, 40),
    },
    siteSignals: {
      headings: safe(data.headings, 60),
      paragraphs: safe(data.paragraphs, 40),
      crawledPages: safe(data.crawledPages, 12),
      contentSample: String(data.bodyText || '').slice(0, 12000),
    },
  };
}

function stringifyProfileData(profile = {}) {
  try {
    return JSON.stringify(profile, null, 2);
  } catch {
    return '{}';
  }
}

/**
 * Parse AI response to extract score, roast, and suggestions
 */
function parseAIResponse(response) {
  let score = 50; // Default score
  let roast = '';
  let suggestions = '';
  let analysis = '';

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

    // Extract analysis but do not display it in UI roast content.
    const analysisMatch = response.match(/ANALYSIS:\s*([\s\S]*?)(?=ROAST:|$)/i);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
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

    roast = normalizeRoastText(roast);

    if (analysis) {
      console.log(`[AI] Profile Analysis (console only):\n${analysis}`);
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

function normalizeRoastText(text = '') {
  const lines = String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim());

  if (!lines.length) return '';

  const joined = lines.join(' ');
  return joined.replace(/\s+/g, ' ').trim();
}
