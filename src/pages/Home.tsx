export default function Home() {
  return (
    <div className="content-section">
      <h2>Welcome to BookPilot</h2>
      <p>
        BookPilot helps you discover books, build a personal collection, and keep track of what you want to rate or read next.
      </p>
      <p>
        <a className="home-section-link" href="/browse">
          <strong>Browse</strong>
        </a>
        : search Open Library to explore titles, authors, and editions with rich results.
      </p>
      <p>
        <a className="home-section-link" href="/catalog">
          <strong>Catalog</strong>
        </a>
        : view and manage the books you've saved to your personal collection.
      </p>
      <p>
        <a className="home-section-link" href="/rate">
          <strong>Rate</strong>
        </a>
        : keep track of your reading opinions and future ratings.
      </p>
    </div>
  )
}
