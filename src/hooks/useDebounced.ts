import { useState, useEffect } from 'react'

/**
 * Hook that debounces a value by a specified delay.
 * Useful for preventing excessive API calls during rapid input changes.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 200ms)
 * @returns The debounced value
 */
export function useDebounced<T>(value: T, delay: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}