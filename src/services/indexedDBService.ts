import type { BookResult } from '../api/openlibraryClient'

export interface SavedBook extends BookResult {
  savedAt: number // Timestamp when book was saved
  status?: 'saved' | 'wishlist' | 'reading' // Book status
  rating?: number // Rating from 0-5
  progress?: number // Reading progress from 0-100
}

const DB_NAME = 'BookPilotDB'
const DB_VERSION = 1
const STORE_NAME = 'savedBooks'

let db: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' })
        store.createIndex('savedAt', 'savedAt', { unique: false })
      }
    }
  })
}

export async function saveBook(book: BookResult): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const savedBook: SavedBook = {
      ...book,
      savedAt: Date.now(),
    }
    const request = store.put(savedBook)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function isBookSaved(bookKey: string): Promise<boolean> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(bookKey)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

export async function getAllSavedBooks(): Promise<SavedBook[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function removeBook(bookKey: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(bookKey)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
export async function updateBookStatus(
  bookKey: string,
  status: 'saved' | 'wishlist' | 'reading'
): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(bookKey)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const book = getRequest.result
      if (book) {
        book.status = status
        const updateRequest = store.put(book)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        reject(new Error('Book not found'))
      }
    }
  })
}

export async function updateBookRating(bookKey: string, rating: number): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(bookKey)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const book = getRequest.result
      if (book) {
        book.rating = Math.max(0, Math.min(5, rating)) // Clamp between 0-5
        const updateRequest = store.put(book)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        reject(new Error('Book not found'))
      }
    }
  })
}

export async function updateBookProgress(bookKey: string, progress: number): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(bookKey)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const book = getRequest.result
      if (book) {
        book.progress = Math.max(0, Math.min(100, progress)) // Clamp between 0-100
        const updateRequest = store.put(book)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        reject(new Error('Book not found'))
      }
    }
  })
}