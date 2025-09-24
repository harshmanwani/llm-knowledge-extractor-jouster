import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allAnalyses, setAllAnalyses] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      setResult(data)
      setSelectedAnalysis(data)
      loadAllAnalyses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const searchAnalyses = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:3000/search?topic=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }
      
      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAllAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:3000/all')
      if (response.ok) {
        const data = await response.json()
        setAllAnalyses(data)
      }
    } catch (err) {
      console.error('Failed to load analyses:', err)
    }
  }

  // Load all analyses on component mount
  useEffect(() => {
    loadAllAnalyses()
  }, [])

  return (
    <div className="app">
      <div className="container">
        <div className="left-panel">
          <div className="input-section">
            <h2>Input</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze..."
              className="text-input"
            />
            <button onClick={analyzeText} disabled={loading} className="analyze-btn">
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          <div className="search-section">
            <h3>Search</h3>
            <div className="search-input">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by topic or keyword..."
                className="search-field"
              />
              <button onClick={searchAnalyses} disabled={loading} className="search-btn">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="analyses-list">
            <h3>All Analyses ({allAnalyses.length})</h3>
            <div className="analyses-items">
              {allAnalyses.map(item => (
                <div 
                  key={item.id} 
                  className={`analysis-item ${selectedAnalysis?.id === item.id ? 'selected' : ''}`}
                  onClick={() => selectedAnalysis && selectedAnalysis.id === item.id ? setSelectedAnalysis(null) : setSelectedAnalysis(item)}
                >
                  <div className="analysis-title">{item.title}</div>
                  <div className="analysis-meta">
                    <span className={`sentiment ${item.sentiment}`}>{item.sentiment}</span>
                    <small>{new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="output-section">
            <h2>Output</h2>
            
            {(selectedAnalysis || result) && (
              <div className="result">
                <div className="result-header">
                  <h3>{(selectedAnalysis || result).title}</h3>
                  <span className={`sentiment ${(selectedAnalysis || result).sentiment}`}>{(selectedAnalysis || result).sentiment}</span>
                </div>
                
                <div className="summary">
                  <h4>Summary</h4>
                  <p>{(selectedAnalysis || result).summary}</p>
                </div>
                
                <div className="metadata">
                  <div className="topics">
                    <h4>Topics</h4>
                    <div className="tags">
                      {(selectedAnalysis || result).topics.map(topic => <span key={topic} className="tag">{topic}</span>)}
                    </div>
                  </div>
                  
                  <div className="keywords">
                    <h4>Keywords</h4>
                    <div className="tags">
                      {(selectedAnalysis || result).keywords.map(keyword => <span key={keyword} className="tag">{keyword}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Search Results ({searchResults.length})</h3>
                {searchResults.map(item => (
                  <div key={item.id} className="search-result">
                    <div className="result-header">
                      <h4>{item.title}</h4>
                      <span className={`sentiment ${item.sentiment}`}>{item.sentiment}</span>
                    </div>
                    <p className="summary-text">{item.summary}</p>
                    <div className="tags">
                      {item.topics.map(topic => <span key={topic} className="tag">{topic}</span>)}
                    </div>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default App