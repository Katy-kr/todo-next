'use client'

import { useTodo } from '@/app/context/TodoContext'

export default function TodoHeader() {
  const { dark, toggleDark } = useTodo()

  return (
    <div className="flex items-center justify-between px-7 py-6 border-b border-[#d9d0f0] dark:border-[#352d50]">
      <h1 className="text-3xl font-bold bg-gradient-to-br from-[#5b7fff] to-[#a78bfa] bg-clip-text text-transparent">
        Todo
      </h1>
      <button
        onClick={toggleDark}
        className="w-10 h-10 rounded-full bg-[#f3effc] dark:bg-[#221d33] border border-[#d9d0f0] dark:border-[#352d50] flex items-center justify-center text-lg hover:rotate-12 transition-transform cursor-pointer"
        aria-label="테마 전환"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
