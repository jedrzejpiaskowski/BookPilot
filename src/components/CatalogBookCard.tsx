import { useState } from 'react'
import type { SavedBook } from '../services/indexedDBService'
import { getCoverUrl } from '../api/openlibraryClient'
import { removeBook, updateBookStatus } from '../services/indexedDBService'

interface CatalogBookCardProps {
  book: SavedBook
  onRemove: (bookKey: string) => void
  onStatusChange?: (bookKey: string, status: 'saved' | 'wishlist' | 'reading') => void
  isMinimal?: boolean
}

export default function CatalogBookCard({
  book,
  onRemove,
  onStatusChange,
  isMinimal = false,
}: CatalogBookCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRemoveBook = async () => {
    if (isRemoving) return

    setIsRemoving(true)
    try {
      await removeBook(book.key)
      onRemove(book.key)
    } catch (error) {
      console.error('Failed to remove book:', error)
      setIsRemoving(false)
    }
  }

  const handleStatusChange = async (newStatus: 'saved' | 'wishlist' | 'reading') => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await updateBookStatus(book.key, newStatus)
      if (onStatusChange) {
        onStatusChange(book.key, newStatus)
      }
    } catch (error) {
      console.error('Failed to update book status:', error)
      setIsUpdating(false)
    }
  }

  if (isMinimal) {
    // Minimal display: cover and title only, for sidebar sections
    const coverId = book.cover_i

    return (
      <div className="catalog-book-card-minimal">
        <div className="minimal-book-cover">
          {coverId ? (
            <img src={getCoverUrl(coverId, 'S')} alt={book.title} loading="lazy" />
          ) : (
            <div className="minimal-cover-placeholder">No cover</div>
          )}
        </div>
        <div className="minimal-book-info">
          <h4 className="minimal-book-title">{book.title}</h4>
          <div className="minimal-book-actions">
            {/* Save button - move back to Saved */}
            <button
              className="action-icon-button"
              onClick={handleStatusChange.bind(null, 'saved')}
              disabled={isUpdating}
              title="Move to Saved"
            >
              ←
            </button>

            {/* Wishlist: Book icon to move to Reading */}
            {book.status === 'wishlist' && (
              <button
                className="action-icon-button"
                onClick={handleStatusChange.bind(null, 'reading')}
                disabled={isUpdating}
                title="Move to Reading"
              >
                📖
              </button>
            )}

            {/* Reading: Pin icon to move to Wishlist */}
            {book.status === 'reading' && (
              <button
                className="action-icon-button"
                onClick={handleStatusChange.bind(null, 'wishlist')}
                disabled={isUpdating}
                title="Move to Wishlist"
              >
                📌
              </button>
            )}

            {/* Remove button */}
            <button
              className="action-icon-button action-remove"
              onClick={handleRemoveBook}
              disabled={isRemoving}
              title="Remove from collection"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full display for Saved Books section
  const coverId = book.cover_i
  const author = book.author_name?.join(', ') ?? 'Unknown author'
  const publishYear = book.first_publish_year ?? 'Unknown year'
  const genre = book.subject?.slice(0, 2).join(', ')
  const pages = book.number_of_pages_median

  // Format the save date
  const savedDate = new Date(book.savedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="catalog-book-card">
      <div className="book-cover">
        {coverId ? (
          <img src={getCoverUrl(coverId, 'M')} alt={book.title} loading="lazy" />
        ) : (
          <div className="cover-placeholder">No cover</div>
        )}
      </div>
      <div className="book-meta">
        <div className="book-header">
          <h3 className="book-title">{book.title}</h3>
          <button
            className="remove-button"
            onClick={handleRemoveBook}
            disabled={isRemoving}
            title="Remove from collection"
          >
            ✕
          </button>
        </div>
        <p className="book-author">{author}</p>
        <p className="book-year">{publishYear}</p>
        {genre && (
          <p className="book-detail">
            <span className="book-label">Genre:</span> {genre}
          </p>
        )}
        {pages && (
          <p className="book-detail">
            <span className="book-label">Pages:</span> {pages}
          </p>
        )}
        <p className="book-saved-date">
          <span className="book-label">Saved:</span> {savedDate}
        </p>
        <div className="book-status-buttons">
          <button
            className={`status-button ${book.status === 'wishlist' ? 'active' : ''}`}
            onClick={handleStatusChange.bind(null, 'wishlist')}
            disabled={isUpdating}
            title="Add to Wishlist"
          >
            📌 Wishlist
          </button>
          <button
            className={`status-button ${book.status === 'reading' ? 'active' : ''}`}
            onClick={handleStatusChange.bind(null, 'reading')}
            disabled={isUpdating}
            title="Add to Reading"
          >
            📖 Reading
          </button>
        </div>
      </div>
    </article>
  )
}
