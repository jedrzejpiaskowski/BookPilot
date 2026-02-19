import { useState, useEffect } from 'react'
import type { SavedBook } from '../services/indexedDBService'
import { getAllSavedBooks } from '../services/indexedDBService'
import RatingBookCard from '../components/RatingBookCard'
import '../styles/Rate.css'

interface RateProps {
  onCountsChange?: () => void
}

export default function Rate({ onCountsChange }: RateProps) {
  const [readingBooks, setReadingBooks] = useState<SavedBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to sort books by progress
  const sortBooksByProgressAndRating = (books: SavedBook[]): SavedBook[] => {
    return [...books].sort((a, b) => {
      return (b.progress ?? 0) - (a.progress ?? 0)
    })
  }

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
      const sorted = sortBooksByProgressAndRating(reading)
      setReadingBooks(sorted)
    } catch (err) {
      console.error('Failed to load reading books:', err)
      setError('Failed to load your reading list')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (bookKey: string, rating: number) => {
    setReadingBooks((prev) => {
      const updated = prev.map((book) =>
        book.key === bookKey ? { ...book, rating } : book
      )
      return sortBooksByProgressAndRating(updated)
    })
  }

  const handleProgressChange = (bookKey: string, progress: number) => {
    setReadingBooks((prev) => {
      const updated = prev.map((book) =>
        book.key === bookKey ? { ...book, progress } : book
      )
      return sortBooksByProgressAndRating(updated)
    })
  }

  const handleRemove = (bookKey: string) => {
    setReadingBooks((prev) => prev.filter((book) => book.key !== bookKey))
    if (onCountsChange) {
      onCountsChange()
    }
  }

  return (
    <div className="content-section">
      <div className="rate-container">
        <h2 className="rate-title">Rate Your Reading</h2>
        <p className="rate-subtitle">Track your progress and rate books as you read</p>

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
                onProgressChange={handleProgressChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
