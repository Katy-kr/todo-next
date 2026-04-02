'use client'

import { useTodo, Filter } from '@/app/context/TodoContext'

const LABELS: Record<Filter, string> = {
  all: '전체',
  active: '미완료',
  completed: '완료',
}

export default function TodoFilter() {
  const { filter, setFilter } = useTodo()

  return (
    <div className="flex gap-1 px-6 py-3 bg-[#f3effc] dark:bg-[#221d33] border-b border-[#d9d0f0] dark:border-[#352d50]">
      {(Object.keys(LABELS) as Filter[]).map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filter === f
              ? 'bg-white dark:bg-[#1a1526] text-[#5b7fff] border border-[#d9d0f0] dark:border-[#352d50] font-semibold'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {LABELS[f]}
        </button>
      ))}
    </div>
  )
}
