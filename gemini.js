require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Please analyze this text and return a JSON response with:
- summary: 1-2 sentence summary
- title: extract or generate a title (use "Untitled" if none found)
- topics: exactly 3 key topics as an array
- sentiment: one of "positive", "neutral", or "negative"

Text: ${text}

JSON format:
{
  "summary": "brief summary here",
  "title": "extracted title",
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

module.exports = { analyzeText };
