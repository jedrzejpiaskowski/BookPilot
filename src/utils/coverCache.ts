/**
 * Image Cache with Blob Storage
 * Caches both URLs and actual image data using browser Cache API
 * Supports both book covers and author photos
 */

const CACHE_NAME = 'bookpilot-images-v1'
const urlCache = new Map<string, string>()
const DEBUG_MODE = true // Set to false in production

/**
 * Log debug information if debug mode is enabled
 */
function debug(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[ImageCache]', ...args)
  }
}

/**
 * Get or initialize the cache storage
 */
async function getCacheStorage(): Promise<Cache> {
  return await caches.open(CACHE_NAME)
}

/**
 * Get a cached cover URL with image blob caching
 * @param coverId - The cover ID from OpenLibrary
 * @param size - The size of the cover ('S', 'M', 'L')
 * @returns The complete cover URL (blob URL if cached, original URL otherwise)
 */
export async function getCachedCoverUrl(
  coverId: number | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): Promise<string | undefined> {
  if (!coverId) return undefined

  const cacheKey = `${coverId}-${size}`
  const url = `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`

  // Check if we have a URL cached
  if (urlCache.has(cacheKey)) {
    debug(`URL cache hit for ${cacheKey}`)
    return urlCache.get(cacheKey)
  }

  try {
    const cache = await getCacheStorage()
    const cachedResponse = await cache.match(url)

    if (cachedResponse) {
      // Image is cached - create blob URL
      const blob = await cachedResponse.blob()
      if (!blob.size || !blob.type) {
        await cache.delete(url)
        urlCache.delete(cacheKey)
        debug(`Cached image invalid for ${cacheKey}, clearing entry`)
        return undefined
      }
      const blobUrl = URL.createObjectURL(blob)
      urlCache.set(cacheKey, blobUrl)
      debug(`Image cache hit for ${cacheKey}, created blob URL`)
      return blobUrl
    } else {
      // Not cached - fetch and cache the image
      debug(`Cache miss for ${cacheKey}, fetching...`)
      const response = await fetch(url)
      
      if (response.ok) {
        // Clone the response before caching (can only read once)
        await cache.put(url, response.clone())
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        urlCache.set(cacheKey, blobUrl)
        debug(`Cached image for ${cacheKey}`)
        return blobUrl
      } else {
        debug(`Failed to fetch ${cacheKey}: ${response.status}`)
        return url // Return original URL as fallback
      }
    }
  } catch (error) {
    debug(`Error with cache for ${cacheKey}:`, error)
    // Fallback to original URL if caching fails
    urlCache.set(cacheKey, url)
    return url
  }
}

/**
 * Clear both URL and image cache
 */
export async function clearCoverCache(): Promise<void> {
  urlCache.clear()
  
  // Clean up blob URLs to prevent memory leaks
  for (const blobUrl of urlCache.values()) {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl)
    }
  }
  
  await caches.delete(CACHE_NAME)
  debug('Cache cleared')
}

/**
 * Get a cached author photo URL with image blob caching
 * @param authorKey - The author key from OpenLibrary (e.g., 'OL23919A' or '/authors/OL23919A')
 * @param size - The size of the photo ('S', 'M', 'L')
 * @returns The complete photo URL (blob URL if cached, original URL otherwise)
 */
export async function getCachedAuthorPhotoUrl(
  authorKey: string | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): Promise<string | undefined> {
  if (!authorKey) return undefined

  // Extract the author ID from the key (e.g., '/authors/OL23919A' -> 'OL23919A')
  const id = authorKey.split('/').pop() || authorKey
  const cacheKey = `author-${id}-${size}`
  const url = `https://covers.openlibrary.org/a/olid/${id}-${size}.jpg`

  // Check if we have a URL cached
  if (urlCache.has(cacheKey)) {
    debug(`URL cache hit for ${cacheKey}`)
    return urlCache.get(cacheKey)
  }

  try {
    const cache = await getCacheStorage()
    const cachedResponse = await cache.match(url)

    if (cachedResponse) {
      // Image is cached - create blob URL
      const blob = await cachedResponse.blob()
      const blobUrl = URL.createObjectURL(blob)
      urlCache.set(cacheKey, blobUrl)
      debug(`Image cache hit for ${cacheKey}, created blob URL`)
      return blobUrl
    } else {
      // Not cached - fetch and cache the image
      debug(`Cache miss for ${cacheKey}, fetching...`)
      const response = await fetch(url)

      if (response.ok) {
        const blob = await response.clone().blob()
        if (!blob.size || !blob.type) {
          debug(`Fetched image invalid for ${cacheKey}, skipping cache`)
          return undefined
        }
        // Clone the response before caching (can only read once)
        await cache.put(url, response)
        const blobUrl = URL.createObjectURL(blob)
        urlCache.set(cacheKey, blobUrl)
        debug(`Cached image for ${cacheKey}`)
        return blobUrl
      } else {
        debug(`Failed to fetch ${cacheKey}: ${response.status}`)
        return undefined // Return undefined for missing author photos
      }
    }
  } catch (error) {
    debug(`Error with cache for ${cacheKey}:`, error)
    return undefined // Return undefined on error for author photos
  }
}

/**
 * Get cache statistics
 */
export async function getCoverCacheStats(): Promise<{
  urlCacheSize: number
  storageCacheSize: number
}> {
  const cache = await getCacheStorage()
  const keys = await cache.keys()
  
  return {
    urlCacheSize: urlCache.size,
    storageCacheSize: keys.length,
  }
}

/**
 * Log cache statistics to console
 */
export async function logCacheStats(): Promise<void> {
  const stats = await getCoverCacheStats()
  console.log('[ImageCache] Statistics:', stats)
}
