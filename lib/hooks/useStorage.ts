'use client'

import { useEffect, useState } from 'react'

type SetValue<T> = (value: T | ((prev: T) => T)) => void

/**
 * useLocalStorage
 * - Lê e escreve no localStorage
 * - Retorna: [value, setValue, isInitialized]
 * - isInitialized = true quando já carregou do localStorage (evita "tela branca")
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)

      if (item !== null) {
        setStoredValue(JSON.parse(item) as T)
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue))
        setStoredValue(initialValue)
      }
    } catch (error) {
      console.error(`[useLocalStorage] erro ao ler key="${key}":`, error)
      setStoredValue(initialValue)
    } finally {
      setIsInitialized(true)
    }
    // não coloque initialValue como dependência, pra não re-inicializar
  }, [key])

  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`[useLocalStorage] erro ao salvar key="${key}":`, error)
    }
  }

  return [storedValue, setValue, isInitialized]
}
