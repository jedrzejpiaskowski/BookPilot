import { useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import type { SearchResponse } from '../api/openlibraryClient'
import { searchResultLimit } from '../constants/search'
import BookResultCard from '../components/BookResultCard'
import '../styles/Browse.css'

const SEARCH_COOLDOWN = 500 // Minimum milliseconds between searches

type BrowseProps = {
  inputValue: string
  setInputValue: Dispatch<SetStateAction<string>>
  actualSearchQuery: string
  setActualSearchQuery: Dispatch<SetStateAction<string>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
  results: SearchResponse | null
  loading: boolean
  error: string | null
  searchType: 'title' | 'author' | 'general'
  setSearchType: Dispatch<SetStateAction<'title' | 'author' | 'general'>>
  onCountsChange?: () => void
}

export default function Browse({
  inputValue,
  setInputValue,
  actualSearchQuery,
  setActualSearchQuery,
  page,
  setPage,
  results,
  loading,
  error,
  searchType,
  setSearchType,
  onCountsChange
}: BrowseProps) {
  const lastSearchTimeRef = useRef(0)

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

  const handleClear = () => {
    setInputValue('')
    setActualSearchQuery('')
    setPage(1)
    setSearchType('general')
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
            placeholder="book title..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />          <select
            className="search-type-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'title' | 'author' | 'general')}
          >
            <option value="general">All fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>          <button 
            className="clear-button" 
            onClick={handleClear}
            title="Clear search"
          >
            <ClearIcon className="clear-icon" />
          </button>          <button className="search-button" onClick={handleSearch} disabled={isSearchDisabled}>
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

          {results && results.docs.length > 0 && (
            <div className="results-container">
              <p className="results-count">
                Here are your results
              </p>
              <div className="results-grid">
                {results.docs.map((book) => (
                  <BookResultCard key={book.key} book={book} onSaveChange={onCountsChange} />
                ))}
              </div>
              {results.docs.length >= searchResultLimit && (
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
              )}
            </div>
          )}

          {results && results.docs.length === 0 && !loading && (
            <div className="results-status">
              <p>No books found. Try a different search.</p>
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
