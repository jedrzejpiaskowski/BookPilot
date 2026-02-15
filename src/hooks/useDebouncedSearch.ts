import { useState, useEffect, useRef } from 'react'
import { searchBooks } from '../api/openlibraryClient'
import type { SearchResponse } from '../api/openlibraryClient'

export function useDebouncedSearch(
  query: string,
  page: number,
  delay: number = 500
): {
  results: SearchResponse | null
  loading: boolean
  error: string | null
} {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Reset if query is empty
    if (!query.trim()) {
      setResults(null)
      setError(null)
      return
    }

    // Set loading state
    setLoading(true)

    // Set debounce timer
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await searchBooks(query, { page, limit: 9 })
        setResults(response)
        setError(null)
        console.log('Search results:', response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setResults(null)
        console.error('Search error:', errorMessage)
      } finally {
        setLoading(false)
      }
    }, delay)

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, page, delay])

  return { results, loading, error }
}
