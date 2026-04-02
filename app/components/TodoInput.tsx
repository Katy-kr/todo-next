'use client'

import { useState } from 'react'
import { useTodo, Priority } from '@/app/context/TodoContext'

export default function TodoInput() {
  const { addTodo } = useTodo()
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')

  const handleAdd = () => {
    if (!text.trim()) return
    addTodo(text, priority)
    setText('')
    setPriority('normal')
  }

  return (
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
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="할 일을 입력하세요..."
          maxLength={200}
          className="flex-1 h-11 px-4 rounded-lg bg-[#f3effc] dark:bg-[#221d33] border border-[#d9d0f0] dark:border-[#352d50] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-[#5b7fff] focus:ring-2 focus:ring-[#5b7fff]/20 text-sm"
        />
        <button
          onClick={handleAdd}
          className="w-11 h-11 rounded-lg bg-[#5b7fff] hover:bg-[#4a6ef0] text-white text-2xl flex items-center justify-center transition-colors cursor-pointer"
          aria-label="추가"
        >
          +
        </button>
      </div>
    </div>
  )
}
