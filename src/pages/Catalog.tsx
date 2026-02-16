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

  const handleStatusChange = (bookKey: string, newStatus: 'saved' | 'wishlist' | 'reading') => {
    setSavedBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.key === bookKey ? { ...book, status: newStatus } : book
      )
    )
  }

  // Filter books by status
  const savedBooksOnly = savedBooks.filter((book) => book.status !== 'wishlist' && book.status !== 'reading')
  const wishlistBooks = savedBooks.filter((book) => book.status === 'wishlist')
  const readingBooks = savedBooks.filter((book) => book.status === 'reading')

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
          <div className="catalog-layout">
            {/* Main content - Saved books (2/3 width) */}
            <div className="catalog-main">
              <div className="catalog-section">
                <h3 className="section-title">Saved Books</h3>
                {savedBooksOnly.length === 0 ? (
                  <p className="section-empty">No saved books yet</p>
                ) : (
                  <div className="section-grid">
                    {savedBooksOnly.map((book) => (
                      <CatalogBookCard
                        key={book.key}
                        book={book}
                        onRemove={handleRemoveBook}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Wishlist and Reading (1/3 width) */}
            <div className="catalog-sidebar">
              {/* Wishlist section */}
              <div className="catalog-side-section">
                <h3 className="side-section-title">Wishlist</h3>
                {wishlistBooks.length === 0 ? (
                  <p className="section-empty">No books in wishlist</p>
                ) : (
                  <div className="side-section-grid">
                    {wishlistBooks.map((book) => (
                      <CatalogBookCard
                        key={book.key}
                        book={book}
                        onRemove={handleRemoveBook}
                        onStatusChange={handleStatusChange}
                        isMinimal={true}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Reading section */}
              <div className="catalog-side-section">
                <h3 className="side-section-title">Reading</h3>
                {readingBooks.length === 0 ? (
                  <p className="section-empty">No books you're reading</p>
                ) : (
                  <div className="side-section-grid">
                    {readingBooks.map((book) => (
                      <CatalogBookCard
                        key={book.key}
                        book={book}
                        onRemove={handleRemoveBook}
                        onStatusChange={handleStatusChange}
                        isMinimal={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
