# LLM Knowledge Extractor

A full-stack application with React UI and Node.js API that processes unstructured text using Google's Gemini AI to generate summaries and extract structured metadata.

# Demo

<iframe width="560" height="315" src="https://www.loom.com/embed/9c21c273dcf04901a39f6a4e0091f162?sid=30f97c57-4ab1-4d42-af48-f2c4823838ef" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## Setup and Run Instructions

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Get Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Run both UI and server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   - Web UI: http://localhost:5173
   - API Health: http://localhost:3000/health

## API Endpoints

### POST /analyze
Analyzes text and returns structured data.

**Request:**
```json
{
  "text": "Your text content here..."
}
```

**Response:**
```json
{
  "id": 1,
  "summary": "Generated summary...",
  "title": "Extracted title",
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /search
Searches stored analyses by topic or keyword.

**Query Parameters:**
- `topic` (required): Topic to search for

**Response:**
```json
[
  {
    "id": 1,
    "summary": "Summary...",
    "title": "Title",
    "topics": ["topic1", "topic2"],
    "sentiment": "positive",
    "keywords": ["keyword1", "keyword2"],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

## Design Choices

I went with Node.js and Express because I'm comfortable with JavaScript and it handles JSON naturally. SQLite was perfect for this prototype - no external database setup needed. I picked Gemini API since it's free and gives good results. The code is split into separate files (database, LLM calls, keyword extraction) to keep things organized. For keywords, I wrote a simple word frequency counter instead of using the LLM - it's faster and more predictable.

## Trade-offs Made

With the 2-hour limit, I focused on getting the core features working rather than adding bells and whistles. The keyword extraction is basic but functional. I skipped authentication and rate limiting since this is just a prototype. Could have added more error handling and tests, but the main functionality works reliably.
