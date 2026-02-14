// OpenLibrary API Client
const OPENLIBRARY_API = 'https://openlibrary.org/search.json'

export interface BookResult {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  isbn?: string[]
  cover_i?: number
}

export interface SearchResponse {
  docs: BookResult[]
  numFound: number
  start: number
}

export async function searchBooks(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return { docs: [], numFound: 0, start: 0 }
  }

  try {
    const response = await fetch(
      `${OPENLIBRARY_API}?title=${encodeURIComponent(query)}&limit=10`
    )

    if (!response.ok) {
      throw new Error(`OpenLibrary API error: ${response.statusText}`)
    }

    const data: SearchResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error searching OpenLibrary:', error)
    throw error
  }
}

// Helper function to get cover image URL
export function getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
}
