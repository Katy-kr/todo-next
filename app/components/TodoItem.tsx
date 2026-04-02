'use client'

import { useState } from 'react'
import { useTodo, Todo, Priority } from '@/app/context/TodoContext'

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-400',
  normal: 'bg-blue-400',
  low: 'bg-green-400',
}

export default function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo, updateTodo } = useTodo()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const commitEdit = () => {
    updateTodo(todo.id, editText)
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 px-6 py-3 border-b border-[#d9d0f0] dark:border-[#352d50] last:border-b-0 hover:bg-[#f3effc] dark:hover:bg-[#221d33] group transition-colors">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(todo.id)}
        className="w-5 h-5 rounded accent-[#5b7fff] cursor-pointer flex-shrink-0"
      />
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[todo.priority]}`} />
      {editing ? (
        <input
          autoFocus
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') { setEditText(todo.text); setEditing(false) }
          }}
          className="flex-1 px-2 py-0.5 rounded bg-[#f3effc] dark:bg-[#221d33] outline-2 outline-[#5b7fff] text-sm text-gray-800 dark:text-gray-100"
        />
      ) : (
        <span
          onDoubleClick={() => { setEditText(todo.text); setEditing(true) }}
          title="더블클릭하여 편집"
          className={`flex-1 text-sm cursor-text break-words ${
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
  )
}
