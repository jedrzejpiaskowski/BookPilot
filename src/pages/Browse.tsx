import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { useDebouncedSearch } from '../hooks/useDebouncedSearch'
import '../styles/Browse.css'

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('')
  const { results, loading, error } = useDebouncedSearch(searchQuery)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Manual search triggered for:', searchQuery)
    }
  }

  return (
    <div className="content-section">
      <div className="browse-container">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="book title, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Results Section */}
        <div className="search-results">
          {loading && (
            <div className="results-status">
              <p>Searching...</p>
            </div>
          )}

          {error && (
            <div className="results-error">
              <p>Error: {error}</p>
            </div>
          )}

          {results && (
            <div className="results-container">
              <p className="results-count">
                Found {results.numFound} books
              </p>
              <pre className="results-json">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          {searchQuery && !loading && !results && !error && (
            <div className="results-status">
              <p>No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
