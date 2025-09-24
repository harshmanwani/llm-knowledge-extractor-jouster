require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const { analyzeText } = require('./gemini');
const { extractKeywords } = require('./keywords');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Please provide some text to analyze' 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured' 
      });
    }

    const analysis = await analyzeText(text);
    const keywords = extractKeywords(text);
    
    const result = {
      summary: analysis.summary,
      title: analysis.title,
      topics: analysis.topics,
      sentiment: analysis.sentiment,
      keywords: keywords
    };

    db.run(
      `INSERT INTO analyses (original_text, summary, title, topics, sentiment, keywords) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [text, result.summary, result.title, JSON.stringify(result.topics), 
       result.sentiment, JSON.stringify(result.keywords)],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save analysis' });
        }
        
        res.json({
          id: this.lastID,
          ...result,
          created_at: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

app.get('/search', (req, res) => {
  try {
    const { topic } = req.query;
    
    if (!topic) {
      return res.status(400).json({ 
        error: 'Please provide a search term' 
      });
    }

    db.all(
      `SELECT * FROM analyses 
       WHERE topics LIKE ? OR keywords LIKE ? 
       ORDER BY created_at DESC`,
      [`%${topic}%`, `%${topic}%`],
      (err, rows) => {
        if (err) {
          console.error('Search error:', err);
          return res.status(500).json({ error: 'Search failed' });
        }
        
        const results = rows.map(row => ({
          id: row.id,
          summary: row.summary,
          title: row.title,
          topics: JSON.parse(row.topics),
          sentiment: row.sentiment,
          keywords: JSON.parse(row.keywords),
          created_at: row.created_at
        }));
        
        res.json(results);
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      details: error.message 
    });
  }
});

app.get('/all', (req, res) => {
  try {
    db.all(
      `SELECT * FROM analyses ORDER BY created_at DESC`,
      (err, rows) => {
        if (err) {
          console.error('Get all analyses error:', err);
          return res.status(500).json({ error: 'Failed to get analyses' });
        }
        
        const results = rows.map(row => ({
          id: row.id,
          summary: row.summary,
          title: row.title,
          topics: JSON.parse(row.topics),
          sentiment: row.sentiment,
          keywords: JSON.parse(row.keywords),
          created_at: row.created_at
        }));
        
        res.json(results);
      }
    );
  } catch (error) {
    console.error('Get all analyses error:', error);
    res.status(500).json({ 
      error: 'Failed to get analyses', 
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
