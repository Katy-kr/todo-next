'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type Priority = 'high' | 'normal' | 'low'
export type Filter = 'all' | 'active' | 'completed'

export interface Todo {
  id: number
  text: string
  done: boolean
  priority: Priority
  createdAt: number
}

interface TodoContextValue {
  todos: Todo[]
  filter: Filter
  dark: boolean
  setFilter: (f: Filter) => void
  toggleDark: () => void
  addTodo: (text: string, priority: Priority) => void
  toggleTodo: (id: number) => void
  deleteTodo: (id: number) => void
  updateTodo: (id: number, text: string) => void
  clearCompleted: () => void
  filteredTodos: Todo[]
  activeCount: number
  completedCount: number
}

const TodoContext = createContext<TodoContextValue | null>(null)

const STORAGE_KEY = 'todo-next-data'
const THEME_KEY = 'todo-next-theme'
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, normal: 1, low: 2 }

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [nextId, setNextId] = useState(1)
  const [filter, setFilter] = useState<Filter>('all')
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setTodos(data.todos ?? [])
        setNextId(data.nextId ?? 1)
      }
    } catch { /* ignore */ }

    const saved = localStorage.getItem(THEME_KEY)
    setDark(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, nextId }))
  }, [todos, nextId, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark, mounted])

  const addTodo = useCallback((text: string, priority: Priority) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [{ id: nextId, text: trimmed, done: false, priority, createdAt: Date.now() }, ...prev])
    setNextId(n => n + 1)
  }, [nextId])

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }, [])

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTodo = useCallback((id: number, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: trimmed } : t))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.done))
  }, [])

  const toggleDark = useCallback(() => setDark(d => !d), [])

  const filteredTodos = todos
    .filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const activeCount = todos.filter(t => !t.done).length
  const completedCount = todos.filter(t => t.done).length

  if (!mounted) return null

  return (
    <TodoContext.Provider value={{
      todos, filter, dark,
      setFilter, toggleDark,
      addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted,
      filteredTodos, activeCount, completedCount,
    }}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodo() {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo must be used within TodoProvider')
  return ctx
}
