import { useState, useEffect } from 'react'
import type { SavedBook } from '../services/indexedDBService'
import { getAllSavedBooks } from '../services/indexedDBService'
import CatalogBookCard from '../components/CatalogBookCard'
import '../styles/Catalog.css'

export default function Catalog() {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSavedBooks()
  }, [])

  const loadSavedBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const books = await getAllSavedBooks()
      // Sort by saved date, newest first
      books.sort((a, b) => b.savedAt - a.savedAt)
      setSavedBooks(books)
    } catch (err) {
      console.error('Failed to load saved books:', err)
      setError('Failed to load your collection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBook = (bookKey: string) => {
    setSavedBooks((prevBooks) => prevBooks.filter((book) => book.key !== bookKey))
  }

  return (
    <div className="content-section">
      <div className="catalog-container">
        <h2 className="catalog-title">My Collection</h2>

        {isLoading && (
          <div className="catalog-status">
            <p>Loading your collection...</p>
          </div>
        )}

        {error && (
          <div className="catalog-error">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && savedBooks.length === 0 && (
          <div className="catalog-empty">
            <p>Your collection is empty</p>
            <p className="catalog-empty-subtitle">
              Browse books and add them to get started!
            </p>
          </div>
        )}

        {!isLoading && savedBooks.length > 0 && (
          <div className="catalog-content">
            <p className="catalog-count">{savedBooks.length} book{savedBooks.length !== 1 ? 's' : ''} in your collection</p>
            <div className="catalog-grid">
              {savedBooks.map((book) => (
                <CatalogBookCard
                  key={book.key}
                  book={book}
                  onRemove={handleRemoveBook}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
