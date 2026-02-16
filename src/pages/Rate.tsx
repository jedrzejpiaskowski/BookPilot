import { useState, useEffect } from 'react'
import type { SavedBook } from '../services/indexedDBService'
import { getAllSavedBooks } from '../services/indexedDBService'
import RatingBookCard from '../components/RatingBookCard'
import '../styles/Rate.css'

export default function Rate() {
  const [readingBooks, setReadingBooks] = useState<SavedBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReadingBooks()
  }, [])

  const loadReadingBooks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const books = await getAllSavedBooks()
      // Filter to only books with 'reading' status
      const reading = books.filter((book) => book.status === 'reading')
      // Sort by rating (highest first), then by saved date (newest first)
      reading.sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
        if (ratingDiff !== 0) return ratingDiff
        return b.savedAt - a.savedAt
      })
      setReadingBooks(reading)
    } catch (err) {
      console.error('Failed to load reading books:', err)
      setError('Failed to load your reading list')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (bookKey: string, rating: number) => {
    setReadingBooks((prev) =>
      prev
        .map((book) =>
          book.key === bookKey ? { ...book, rating } : book
        )
        .sort((a, b) => {
          const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
          if (ratingDiff !== 0) return ratingDiff
          return b.savedAt - a.savedAt
        })
    )
  }

  const handleRemove = (bookKey: string) => {
    setReadingBooks((prev) => prev.filter((book) => book.key !== bookKey))
  }

  return (
    <div className="content-section">
      <div className="rate-container">
        <h2 className="rate-title">Rate Your Reading</h2>
        <p className="rate-subtitle">Share your thoughts on books you're reading</p>

        {isLoading && (
          <div className="rate-status">
            <p>Loading your reading list...</p>
          </div>
        )}

        {error && (
          <div className="rate-error">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && readingBooks.length === 0 && (
          <div className="rate-empty">
            <p>No books in your reading list</p>
            <p className="rate-empty-subtitle">
              Add books from your wishlist or saved collection to start rating
            </p>
          </div>
        )}

        {!isLoading && readingBooks.length > 0 && (
          <div className="reading-books-grid">
            {readingBooks.map((book) => (
              <RatingBookCard
                key={book.key}
                book={book}
                onRatingChange={handleRatingChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
