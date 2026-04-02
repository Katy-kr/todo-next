'use client'

import { useTodo } from '@/app/context/TodoContext'
import TodoHeader from './TodoHeader'
import TodoInput from './TodoInput'
import TodoFilter from './TodoFilter'
import TodoList from './TodoList'
import TodoFooter from './TodoFooter'

export default function TodoBoard() {
  const { dark } = useTodo()

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#ede9f6] dark:bg-[#0e0b1a] transition-colors duration-200 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white dark:bg-[#1a1526] rounded-2xl shadow-xl overflow-hidden">
          <TodoHeader />
          <TodoInput />
          <TodoFilter />
          <TodoList />
          <TodoFooter />
        </div>
      </div>
    </div>
  )
}
