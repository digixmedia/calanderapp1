import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const existing = window.localStorage.getItem(key)
      return existing ? JSON.parse(existing) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors
    }
  }, [key, value])

  return [value, setValue]
}
