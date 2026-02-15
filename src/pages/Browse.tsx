import { useState, useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { useDebouncedSearch } from '../hooks/useDebouncedSearch'
import BookResultCard from '../components/BookResultCard'
import '../styles/Browse.css'

const SEARCH_COOLDOWN = 500 // Minimum milliseconds between searches

export default function Browse() {
  const [inputValue, setInputValue] = useState('')
  const [actualSearchQuery, setActualSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const lastSearchTimeRef = useRef(0)
  const { results, loading, error } = useDebouncedSearch(actualSearchQuery, page)

  const handleSearch = () => {
    const now = Date.now()
    const timeSinceLastSearch = now - lastSearchTimeRef.current

    if (!inputValue.trim()) {
      return
    }

    if (timeSinceLastSearch < SEARCH_COOLDOWN) {
      return
    }

    lastSearchTimeRef.current = now
    setActualSearchQuery(inputValue)
    setPage(1)
  }

  const isSearchDisabled = loading || (Date.now() - lastSearchTimeRef.current) < SEARCH_COOLDOWN

  return (
    <div className="content-section">
      <div className="browse-container">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="book title, author..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <button className="search-button" onClick={handleSearch} disabled={isSearchDisabled}>
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
                Here are your results
              </p>
              <div className="results-grid">
                {results.docs.map((book) => (
                  <BookResultCard key={book.key} book={book} />
                ))}
              </div>
              <div className="results-pagination">
                <button
                  className="pagination-button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page}
                </span>
                <button
                  className="pagination-button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading || results.docs.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {actualSearchQuery && !loading && !results && !error && (
            <div className="results-status">
              <p>No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
