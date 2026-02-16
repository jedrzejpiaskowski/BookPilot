import { useState, useEffect } from 'react'
import { getCachedCoverUrl } from '../utils/coverCache'

/**
 * Custom hook to load and cache book cover images
 * @param coverId - The cover ID from OpenLibrary
 * @param size - The size of the cover ('S', 'M', 'L')
 * @returns The cover URL (blob URL if cached, or undefined while loading)
 */
export function useCoverImage(
  coverId: number | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): string | undefined {
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!coverId) {
      setCoverUrl(undefined)
      return
    }

    let cancelled = false

    getCachedCoverUrl(coverId, size).then((url) => {
      if (!cancelled) {
        setCoverUrl(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [coverId, size])

  return coverUrl
}
