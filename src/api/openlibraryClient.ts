// OpenLibrary API Client
import { searchResultLimit } from '../constants/search'
const OPENLIBRARY_API = 'https://openlibrary.org/search.json'

export interface BookResult {
  key: string
  title: string
  author_name?: string[]
  author_key?: string[]
  first_publish_year?: number
  subject?: string[]
  number_of_pages_median?: number
  isbn?: string[]
  cover_i?: number
  rating?: number // 0-5 star rating
  status?: 'saved' | 'wishlist' | 'reading'
}

export interface Author {
  key: string
  name: string
  birth_date?: string
  death_date?: string
  bio?: string | { type: string; value: string }
  photos?: number[]
  alternate_names?: string[]
  wikipedia?: string
  links?: Array<{ title: string; url: string }>
}

export interface SearchResponse {
  docs: BookResult[]
  numFound: number
  start: number
}

export async function searchBooks(
  query: string,
  options: { limit?: number; page?: number; searchType?: 'title' | 'author' | 'general' } = {}
): Promise<SearchResponse> {
  if (!query.trim()) {
    return { docs: [], numFound: 0, start: 0 }
  }

  const limit = options.limit ?? searchResultLimit
  const page = options.page ?? 1
  const offset = (page - 1) * limit
  const searchType = options.searchType ?? 'general'

  let queryParam = ''
  if (searchType === 'title') {
    queryParam = `title=${encodeURIComponent(query)}`
  } else if (searchType === 'author') {
    queryParam = `author=${encodeURIComponent(query)}`
  } else {
    queryParam = `q=${encodeURIComponent(query)}`
  }

  try {
    const response = await fetch(
      `${OPENLIBRARY_API}?${queryParam}&limit=${limit}&offset=${offset}`
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

// Helper function to get author photo URL
export function getAuthorPhotoUrl(authorId: string, size: 'S' | 'M' | 'L' = 'M'): string {
  // Extract the author ID from the key (e.g., '/authors/OL23919A' -> 'OL23919A')
  const id = authorId.split('/').pop() || authorId
  return `https://covers.openlibrary.org/a/olid/${id}-${size}.jpg`
}

// Fetch author details
export async function fetchAuthor(authorKey: string): Promise<Author | null> {
  if (!authorKey) return null

  try {
    // Extract the author ID and construct the API URL
    const id = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`
    const response = await fetch(`https://openlibrary.org${id}.json`)

    if (!response.ok) {
      throw new Error(`Author API error: ${response.statusText}`)
    }

    const data: Author = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching author:', error)
    return null
  }
}
