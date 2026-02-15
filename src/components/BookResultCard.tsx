import type { BookResult } from '../api/openlibraryClient'
import { getCoverUrl } from '../api/openlibraryClient'

interface BookResultCardProps {
  book: BookResult
}

export default function BookResultCard({ book }: BookResultCardProps) {
    console.log(book);
  const coverId = book.cover_i
  const author = book.author_name?.join(', ') ?? 'Unknown author'
  const publishYear = book.first_publish_year ?? 'Unknown year'
  const genre = book.subject?.slice(0, 2).join(', ')
  const pages = book.number_of_pages_median

  return (
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
        <h3 className="book-title">{book.title}</h3>
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
  )
}
