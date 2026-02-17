import { useState, useEffect } from 'react'
import { getCachedAuthorPhotoUrl } from '../utils/coverCache'

/**
 * Custom hook to load and cache author photos
 * @param authorKey - The author key from OpenLibrary (e.g., 'OL23919A' or '/authors/OL23919A')
 * @param size - The size of the photo ('S', 'M', 'L')
 * @returns The photo URL (blob URL if cached, or undefined if not available)
 */
export function useAuthorImage(
  authorKey: string | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): string | undefined {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!authorKey) {
      setPhotoUrl(undefined)
      return
    }

    let cancelled = false

    getCachedAuthorPhotoUrl(authorKey, size).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [authorKey, size])

  return photoUrl
}
