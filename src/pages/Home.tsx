import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllSavedBooks } from '../services/indexedDBService'

export default function Home() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    savedBooks: 0,
    readingBooks: 0,
    completedBooks: 0,
    averageRating: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const books = await getAllSavedBooks()
      
      const totalBooks = books.length
      const savedBooks = books.filter(book => book.status === 'saved').length
      const wishlistBooks = books.filter(book => book.status === 'wishlist').length
      const readingBooks = books.filter(book => book.status === 'reading').length
      
      // Completed books have 100% progress
      const completedBooks = books.filter(book => book.progress === 100)
      const booksAt100Percent = completedBooks.length
      
      // Calculate average rating for completed books with ratings
      const completedWithRatings = completedBooks.filter(book => book.rating && book.rating > 0)
      const averageRating = completedWithRatings.length > 0
        ? completedWithRatings.reduce((sum, book) => sum + (book.rating || 0), 0) / completedWithRatings.length
        : 0

      setStats({
        totalBooks,
        savedBooks: savedBooks + wishlistBooks,
        readingBooks,
        completedBooks: booksAt100Percent,
        averageRating
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="content-section">
      <h2>Welcome to BookPilot</h2>
      <p>
        BookPilot helps you discover books, build a personal collection, and keep track of what you want to rate or read next.
      </p>

      {isLoading && (
        <div className="stats-loading">
          <p>Loading your statistics...</p>
        </div>
      )}

      {!isLoading && stats.totalBooks > 0 && (
        <div className="stats-container">
          <h3 className="stats-title">Your Reading Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalBooks}</div>
              <div className="stat-label">Total Books</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.savedBooks}</div>
              <div className="stat-label">Saved / Wishlist</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.readingBooks}</div>
              <div className="stat-label">Currently Reading</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completedBooks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-highlight">
              <div className="stat-value">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                {stats.averageRating > 0 && <span className="stat-stars">★</span>}
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      )}

      <div className="home-links">
        <p>
          <Link className="home-section-link" to="/browse">
            <strong>Browse</strong>
          </Link>
          : search Open Library to explore titles, authors, and editions with rich results.
        </p>
        <p>
          <Link className="home-section-link" to="/catalog">
            <strong>Catalog</strong>
          </Link>
          : view and manage the books you've saved to your personal collection.
        </p>
        <p>
          <Link className="home-section-link" to="/rate">
            <strong>Rate</strong>
          </Link>
          : keep track of your reading opinions and future ratings.
        </p>
      </div>
    </div>
  )
}
