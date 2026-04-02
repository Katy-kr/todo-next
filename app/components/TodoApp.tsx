'use client'

import { useState, useEffect, useCallback } from 'react'

type Priority = 'high' | 'normal' | 'low'
type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  done: boolean
  priority: Priority
  createdAt: number
}

const STORAGE_KEY = 'todo-next-data'
const THEME_KEY = 'todo-next-theme'
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, normal: 1, low: 2 }

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-400',
  normal: 'bg-blue-400',
  low: 'bg-green-400',
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [nextId, setNextId] = useState(1)
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [filter, setFilter] = useState<Filter>('all')
  const [dark, setDark] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setTodos(data.todos || [])
        setNextId(data.nextId || 1)
      }
    } catch { /* ignore */ }

    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      setDark(savedTheme === 'dark')
    } else {
      setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, nextId }))
  }, [todos, nextId, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark, mounted])

  const addTodo = useCallback(() => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [{
      id: nextId,
      text,
      done: false,
      priority,
      createdAt: Date.now(),
    }, ...prev])
    setNextId(n => n + 1)
    setInput('')
    setPriority('normal')
  }, [input, priority, nextId])

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.done))
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const commitEdit = (id: number) => {
    const text = editText.trim()
    if (text) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t))
    }
    setEditingId(null)
  }

  const filtered = todos
    .filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const activeCount = todos.filter(t => !t.done).length
  const completedCount = todos.filter(t => t.done).length

  if (!mounted) return null

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#ede9f6] dark:bg-[#0e0b1a] transition-colors duration-200 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white dark:bg-[#1a1526] rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-6 border-b border-[#d9d0f0] dark:border-[#352d50]">
            <h1 className="text-3xl font-bold bg-gradient-to-br from-[#5b7fff] to-[#a78bfa] bg-clip-text text-transparent">
              Todo
            </h1>
            <button
              onClick={() => setDark(d => !d)}
              className="w-10 h-10 rounded-full bg-[#f3effc] dark:bg-[#221d33] border border-[#d9d0f0] dark:border-[#352d50] flex items-center justify-center text-lg hover:rotate-12 transition-transform cursor-pointer"
              aria-label="테마 전환"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Input */}
          <div className="px-6 py-5 border-b border-[#d9d0f0] dark:border-[#352d50]">
            <div className="flex gap-2 items-center">
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="h-11 px-3 rounded-lg bg-[#f3effc] dark:bg-[#221d33] border border-[#d9d0f0] dark:border-[#352d50] text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-[#5b7fff] cursor-pointer"
              >
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="low">낮음</option>
              </select>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="할 일을 입력하세요..."
                maxLength={200}
                className="flex-1 h-11 px-4 rounded-lg bg-[#f3effc] dark:bg-[#221d33] border border-[#d9d0f0] dark:border-[#352d50] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-[#5b7fff] focus:ring-2 focus:ring-[#5b7fff]/20 text-sm"
              />
              <button
                onClick={addTodo}
                className="w-11 h-11 rounded-lg bg-[#5b7fff] hover:bg-[#4a6ef0] text-white text-2xl flex items-center justify-center transition-colors cursor-pointer"
                aria-label="추가"
              >
                +
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-1 px-6 py-3 bg-[#f3effc] dark:bg-[#221d33] border-b border-[#d9d0f0] dark:border-[#352d50]">
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-white dark:bg-[#1a1526] text-[#5b7fff] border border-[#d9d0f0] dark:border-[#352d50] font-semibold'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {f === 'all' ? '전체' : f === 'active' ? '미완료' : '완료'}
              </button>
            ))}
          </div>

          {/* List */}
          <ul className="min-h-12 py-2">
            {filtered.length === 0 ? (
              <li className="flex flex-col items-center gap-3 py-12 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-[#f3effc] dark:bg-[#221d33] flex items-center justify-center text-2xl font-bold text-[#5b7fff]">✓</div>
                <p className="text-sm">할 일이 없습니다</p>
              </li>
            ) : filtered.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-6 py-3 border-b border-[#d9d0f0] dark:border-[#352d50] last:border-b-0 hover:bg-[#f3effc] dark:hover:bg-[#221d33] group transition-colors"
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded accent-[#5b7fff] cursor-pointer flex-shrink-0"
                />
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[todo.priority]}`} />
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => commitEdit(todo.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(todo.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 px-2 py-0.5 rounded bg-[#f3effc] dark:bg-[#221d33] outline-2 outline-[#5b7fff] text-sm text-gray-800 dark:text-gray-100"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(todo)}
                    title="더블클릭하여 편집"
                    className={`flex-1 text-sm cursor-text ${
                      todo.done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all cursor-pointer text-sm"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#f3effc] dark:bg-[#221d33] border-t border-[#d9d0f0] dark:border-[#352d50]">
            <span className="text-xs text-gray-400">{activeCount}개 남음</span>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                완료 항목 삭제
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
