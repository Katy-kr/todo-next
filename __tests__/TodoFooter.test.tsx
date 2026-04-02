import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider, useTodo } from '@/app/context/TodoContext'
import TodoFooter from '@/app/components/TodoFooter'

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
})
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false }) })

// 할 일을 미리 추가한 후 Footer를 렌더하는 헬퍼
function WrapperWithTodos({ completedCount = 0 }: { completedCount?: number }) {
  function Inner() {
    const { addTodo, toggleTodo } = useTodo()
    return (
      <div>
        <button onClick={() => { addTodo('할 일 A', 'normal'); addTodo('할 일 B', 'normal') }}>setup</button>
        <button onClick={() => toggleTodo(1)}>toggle-1</button>
        <button onClick={() => toggleTodo(2)}>toggle-2</button>
        <TodoFooter />
      </div>
    )
  }
  return <TodoProvider><Inner /></TodoProvider>
}

describe('TodoFooter 컴포넌트', () => {
  test('남은 개수가 표시된다', async () => {
    render(<WrapperWithTodos />)
    await userEvent.click(screen.getByText('setup'))
    expect(screen.getByText(/2개 남음/)).toBeInTheDocument()
  })

  test('완료 항목이 없으면 "완료 항목 삭제" 버튼이 보이지 않는다', async () => {
    render(<WrapperWithTodos />)
    await userEvent.click(screen.getByText('setup'))
    expect(screen.queryByText('완료 항목 삭제')).not.toBeInTheDocument()
  })

  test('완료 항목이 있으면 "완료 항목 삭제" 버튼이 나타난다', async () => {
    render(<WrapperWithTodos />)
    await userEvent.click(screen.getByText('setup'))
    await userEvent.click(screen.getByText('toggle-1'))
    expect(screen.getByText('완료 항목 삭제')).toBeInTheDocument()
  })

  test('"완료 항목 삭제" 클릭 시 완료 항목이 제거되고 버튼이 사라진다', async () => {
    render(<WrapperWithTodos />)
    await userEvent.click(screen.getByText('setup'))
    await userEvent.click(screen.getByText('toggle-1'))

    await userEvent.click(screen.getByText('완료 항목 삭제'))
    expect(screen.getByText(/1개 남음/)).toBeInTheDocument()
    expect(screen.queryByText('완료 항목 삭제')).not.toBeInTheDocument()
  })

  test('완료 후 남은 개수가 정확히 업데이트된다', async () => {
    render(<WrapperWithTodos />)
    await userEvent.click(screen.getByText('setup'))
    expect(screen.getByText(/2개 남음/)).toBeInTheDocument()

    await userEvent.click(screen.getByText('toggle-1'))
    expect(screen.getByText(/1개 남음/)).toBeInTheDocument()

    await userEvent.click(screen.getByText('toggle-2'))
    expect(screen.getByText(/0개 남음/)).toBeInTheDocument()
  })
})
