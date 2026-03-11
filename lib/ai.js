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

  return `
Analyze this developer portfolio and provide a ${modeText[mode] || 'roast'}:

Portfolio URL: ${data.url}
Title: ${data.title}
Description: ${data.description}

Headings found: ${data.headings.join(', ')}
Number of images: ${data.images.length}
Number of links: ${data.links.length}

Content snippets:
${data.paragraphs.slice(0, 3).join('\n')}

Please provide your response in the following format:

SCORE: [0-100]
ROAST: [Your ${mode} feedback here - 2-3 paragraphs]
SUGGESTIONS: [3-5 actionable suggestions to improve the portfolio]

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
