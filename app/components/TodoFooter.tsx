'use client'

import { useTodo } from '@/app/context/TodoContext'

export default function TodoFooter() {
  const { activeCount, completedCount, clearCompleted } = useTodo()

  return (
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
  )
}
