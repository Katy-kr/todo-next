'use client'

import { useTodo } from '@/app/context/TodoContext'
import TodoItem from './TodoItem'

export default function TodoList() {
  const { filteredTodos } = useTodo()

  if (filteredTodos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-[#f3effc] dark:bg-[#221d33] flex items-center justify-center text-2xl font-bold text-[#5b7fff]">
          ✓
        </div>
        <p className="text-sm">할 일이 없습니다</p>
      </div>
    )
  }

  return (
    <ul className="py-2">
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
