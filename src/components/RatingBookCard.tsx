import { useState } from 'react'
import type { SavedBook } from '../services/indexedDBService'
import { useCoverImage } from '../hooks/useCoverImage'
import { updateBookRating, removeBook } from '../services/indexedDBService'

interface RatingBookCardProps {
  book: SavedBook
  onRatingChange?: (bookKey: string, rating: number) => void
  onRemove?: (bookKey: string) => void
}

export default function RatingBookCard({
  book,
  onRatingChange,
  onRemove,
}: RatingBookCardProps) {
  const [rating, setRating] = useState<number>(book.rating ?? 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const coverUrl = useCoverImage(book.cover_i, 'M')
  const author = book.author_name?.join(', ') ?? 'Unknown author'

  const handleStarClick = async (starRating: number) => {
    if (isUpdating || starRating === rating) return

    setIsUpdating(true)
    try {
      await updateBookRating(book.key, starRating)
      setRating(starRating)
      if (onRatingChange) {
        onRatingChange(book.key, starRating)
      }
    } catch (error) {
      console.error('Failed to update rating:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (isRemoving) return

    setIsRemoving(true)
    try {
      await removeBook(book.key)
      if (onRemove) {
        onRemove(book.key)
      }
    } catch (error) {
      console.error('Failed to remove book:', error)
      setIsRemoving(false)
    }
  }

  return (
    <article className={`rating-book-card ${
      rating === 5 ? 'rating-five-stars' : rating === 4 ? 'rating-four-stars' : ''
    }`}>
      <div className="rating-book-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} loading="lazy" />
        ) : (
          <div className="rating-cover-placeholder">No cover</div>
        )}
      </div>
      <div className="rating-book-info">
        <h3 className="rating-book-title">{book.title}</h3>
        <p className="rating-book-author">{author}</p>

        {/* Star Rating System */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`rating-star ${star <= rating ? 'filled' : 'empty'}`}
              onClick={() => handleStarClick(star)}
              disabled={isUpdating}
              title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>

        {/* Rating display */}
        {rating > 0 && (
          <p className="rating-display">{rating.toFixed(1)}/5</p>
        )}

        {/* Remove button */}
        <button
          className="remove-from-reading"
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove from reading"
        >
          ✕ Remove
        </button>
      </div>
    </article>
  )
}
