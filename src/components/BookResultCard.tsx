import { useState, useEffect } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import type { BookResult, Author } from '../api/openlibraryClient'
import { fetchAuthor } from '../api/openlibraryClient'
import { useCoverImage } from '../hooks/useCoverImage'
import { useAuthorImage } from '../hooks/useAuthorImage'
import { saveBook, isBookSaved, removeBook } from '../services/indexedDBService'
import '../styles/BookDetails.css'

interface BookResultCardProps {
  book: BookResult
  onSaveChange?: () => void
}

export default function BookResultCard({ book, onSaveChange }: BookResultCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [author, setAuthor] = useState<Author | null>(null)
  const [authorLoading, setAuthorLoading] = useState(false)
  const [authorPhotoError, setAuthorPhotoError] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => {
    // Check if this book is already in the saved collection
    isBookSaved(book.key).then(setIsSaved).catch(console.error)
  }, [book.key])

  // Fetch author data when dialog opens
  useEffect(() => {
    if (detailsOpen && book.author_key && book.author_key.length > 0) {
      setAuthorLoading(true)
      setAuthorPhotoError(false)
      setShowFullBio(false)
      fetchAuthor(book.author_key[0])
        .then(setAuthor)
        .catch(console.error)
        .finally(() => setAuthorLoading(false))
    }
  }, [detailsOpen, book.author_key])

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
      // Notify parent to refresh counts
      if (onSaveChange) {
        onSaveChange()
      }
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
  const coverUrl = useCoverImage(coverId, 'M')
  const authorName = book.author_name?.join(', ') ?? 'Unknown author'
  const publishYear = book.first_publish_year ?? 'Unknown year'
  const genre = book.subject?.slice(0, 2).join(', ')
  const pages = book.number_of_pages_median
  
  // Use the author image hook for cached photos
  const authorPhotoUrl = useAuthorImage(author?.key, 'M')

  const authorBio = typeof author?.bio === 'string' 
    ? author.bio 
    : author?.bio?.value || null
  const maxBioLength = 300
  const isBioLong = !!authorBio && authorBio.length > maxBioLength
  const displayedBio = authorBio && !showFullBio && isBioLong
    ? authorBio.substring(0, maxBioLength) + '...'
    : authorBio

  return (
    <>
    <article className="book-result-card" onClick={() => setDetailsOpen(true)} style={{ cursor: 'pointer' }}>
      <div className="book-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
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
            onClick={(e) => {
              e.stopPropagation()
              handleSaveBook()
            }}
            disabled={isSaving}
            title={isSaved ? 'Remove from your collection' : 'Add to your collection'}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
        <p className="book-author">{authorName}</p>
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

    <Dialog 
      open={detailsOpen} 
      onClose={() => setDetailsOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'book-details-dialog'
      }}
    >
      <div className="book-details-header">
        <h2 className="details-title">{book.title}</h2>
        <IconButton
          onClick={() => setDetailsOpen(false)}
          className="close-button"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent className="book-details-content">
        <div className="details-main-grid">
          {/* Left side - Book Information */}
          <div className="details-layout">
            <div className="details-cover">
              {coverUrl ? (
                <img src={coverUrl} alt={book.title} />
              ) : (
                <div className="details-cover-placeholder">No cover</div>
              )}
            </div>
            <div className="details-info">
              <div className="detail-item">
                <span className="detail-label">Author:</span>
                <span className="detail-value">{authorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Published:</span>
                <span className="detail-value">{publishYear}</span>
              </div>
              {pages && (
                <div className="detail-item">
                  <span className="detail-label">Pages:</span>
                  <span className="detail-value">{pages}</span>
                </div>
              )}
              {book.subject && book.subject.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Genres:</span>
                  <span className="detail-value">{book.subject.slice(0, 5).join(', ')}</span>
                </div>
              )}
              {book.isbn && book.isbn.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">ISBN:</span>
                  <span className="detail-value detail-mono">{book.isbn[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Author Information */}
          {book.author_key && book.author_key.length > 0 && (
            <div className="author-section">
              <h3 className="author-section-title">About the Author</h3>
              {authorLoading && (
                <div className="author-loading">Loading author info...</div>
              )}
              {!authorLoading && author && (
                <div className="author-details">
                  {authorPhotoUrl && !authorPhotoError && (
                    <div className="author-photo">
                      <img 
                        src={authorPhotoUrl} 
                        alt={author.name}
                        onError={() => setAuthorPhotoError(true)}
                      />
                    </div>
                  )}
                  <div className="author-info">
                    <h4 className="author-name">{author.name}</h4>
                    {(author.birth_date || author.death_date) && (
                      <p className="author-dates">
                        {author.birth_date || '?'} - {author.death_date || 'present'}
                      </p>
                    )}
                    {authorBio && (
                      <p className="author-bio">
                        {displayedBio}
                        {isBioLong && (
                          <button
                            type="button"
                            className="author-bio-toggle"
                            onClick={() => setShowFullBio((prev) => !prev)}
                          >
                            {showFullBio ? 'Hide' : 'Show more'}
                          </button>
                        )}
                      </p>
                    )}
                    {author.alternate_names && author.alternate_names.length > 0 && (
                      <p className="author-alternate">
                        <strong>Also known as:</strong> {author.alternate_names.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!authorLoading && !author && (
                <p className="author-unavailable">Author information not available</p>
              )}
            </div>
          )}
        </div>
        
        <button
          className={`save-button-large ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            handleSaveBook()
          }}
          disabled={isSaving}
        >
          {isSaved ? '★ Saved' : '☆ Save to Collection'}
        </button>
      </DialogContent>
    </Dialog>
    </>
  )
}
