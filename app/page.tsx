import { TodoProvider } from '@/app/context/TodoContext'
import TodoBoard from '@/app/components/TodoBoard'

export default function Page() {
  return (
    <TodoProvider>
      <TodoBoard />
    </TodoProvider>
  )
}
