import './App.css'
import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Browse from './pages/Browse'
import Catalog from './pages/Catalog'
import Rate from './pages/Rate'
import Home from './pages/Home'
import { useDebouncedSearch } from './hooks/useDebouncedSearch'
import { getAllSavedBooks } from './services/indexedDBService'

function AppContent() {
  const [inputValue, setInputValue] = useState('')
  const [actualSearchQuery, setActualSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [searchType, setSearchType] = useState<'title' | 'author' | 'general'>('general')
  const [catalogCount, setCatalogCount] = useState(0)
  const [rateCount, setRateCount] = useState(0)
  const { results, loading, error } = useDebouncedSearch(actualSearchQuery, page, searchType)

  // Function to refresh counts from database
  const refreshCounts = useCallback(async () => {
    try {
      const books = await getAllSavedBooks()
      setCatalogCount(books.length)
      setRateCount(books.filter(book => book.status === 'reading').length)
    } catch (error) {
      console.error('Failed to load book counts:', error)
    }
  }, [])

  // Load counts on mount
  useEffect(() => {
    refreshCounts()
  }, [refreshCounts])

  return (
    <div className="app-container">
      <header className="header">
        <h1>BookPilot</h1>
        <p>Your personal book reading companion</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Navigation catalogCount={catalogCount} rateCount={rateCount} />

        <main>
          <Routes>
            <Route
              path="/browse"
              element={
                <Browse
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  actualSearchQuery={actualSearchQuery}
                  setActualSearchQuery={setActualSearchQuery}
                  page={page}
                  setPage={setPage}
                  results={results}
                  loading={loading}
                  error={error}
                  searchType={searchType}
                  setSearchType={setSearchType}
                  onCountsChange={refreshCounts}
                />
              }
            />
            <Route path="/catalog" element={<Catalog onCountsChange={refreshCounts} />} />
            <Route path="/rate" element={<Rate onCountsChange={refreshCounts} />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
