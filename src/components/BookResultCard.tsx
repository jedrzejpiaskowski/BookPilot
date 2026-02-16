import { useState, useEffect } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { BookResult } from '../api/openlibraryClient'
import { getCoverUrl } from '../api/openlibraryClient'
import { saveBook, isBookSaved, removeBook } from '../services/indexedDBService'

interface BookResultCardProps {
  book: BookResult
}

export default function BookResultCard({ book }: BookResultCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    // Check if this book is already in the saved collection
    isBookSaved(book.key).then(setIsSaved).catch(console.error)
  }, [book.key])

  const handleSaveBook = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const trimmedTitle = book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title
      if (isSaved) {
        // Remove the book from collection
        await removeBook(book.key)
        setIsSaved(false)
        setToastMessage(`Removed "${trimmedTitle}" from your collection`)
      } else {
        // Add the book to collection
        await saveBook(book)
        setIsSaved(true)
        setToastMessage(`Added "${trimmedTitle}" to your collection`)
      }
      setToastOpen(true)
    } catch (error) {
      console.error('Failed to save/remove book:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseToast = () => {
    setToastOpen(false)
  }

  const coverId = book.cover_i
  const author = book.author_name?.join(', ') ?? 'Unknown author'
  const publishYear = book.first_publish_year ?? 'Unknown year'
  const genre = book.subject?.slice(0, 2).join(', ')
  const pages = book.number_of_pages_median

  return (
    <>
    <article className="book-result-card">
      <div className="book-cover">
        {coverId ? (
          <img
            src={getCoverUrl(coverId, 'M')}
            alt={book.title}
            loading="lazy"
          />
        ) : (
          <div className="cover-placeholder">No cover</div>
        )}
      </div>
      <div className="book-meta">
        <div className="book-header">
          <h3 className="book-title">{book.title}</h3>
          <button
            className={`save-button ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveBook}
            disabled={isSaving}
            title={isSaved ? 'Remove from your collection' : 'Add to your collection'}
          >
            {isSaved ? '★' : '☆'}
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
      </div>
    </article>
    <Snackbar
      open={toastOpen}
      autoHideDuration={2000}
      onClose={handleCloseToast}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleCloseToast}
        severity="success"
        sx={{ width: '100%' }}
      >
        {toastMessage}
      </Alert>
    </Snackbar>
    </>
  )
}
