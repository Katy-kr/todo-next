import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider } from '@/app/context/TodoContext'
import TodoItem from '@/app/components/TodoItem'
import { Todo } from '@/app/context/TodoContext'

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
})
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false }) })

const mockTodo: Todo = {
  id: 1,
  text: '테스트 할 일',
  done: false,
  priority: 'normal',
  createdAt: Date.now(),
}

function Wrapper({ todo }: { todo: Todo }) {
  return <TodoProvider><ul><TodoItem todo={todo} /></ul></TodoProvider>
}

describe('TodoItem 컴포넌트', () => {
  test('할 일 텍스트가 렌더링된다', () => {
    render(<Wrapper todo={mockTodo} />)
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument()
  })

  test('완료된 항목은 line-through 스타일을 가진다', () => {
    render(<Wrapper todo={{ ...mockTodo, done: true }} />)
    const text = screen.getByText('테스트 할 일')
    expect(text).toHaveClass('line-through')
  })

  test('체크박스가 done 상태를 반영한다', () => {
    render(<Wrapper todo={{ ...mockTodo, done: true }} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  test('미완료 항목의 체크박스는 체크되지 않는다', () => {
    render(<Wrapper todo={mockTodo} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  test('더블클릭 시 편집 모드로 전환된다', async () => {
    render(<Wrapper todo={mockTodo} />)
    const text = screen.getByText('테스트 할 일')
    await userEvent.dblClick(text)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('테스트 할 일')
  })

  test('편집 중 Escape 키를 누르면 원래 텍스트로 복원된다', async () => {
    render(<Wrapper todo={mockTodo} />)
    await userEvent.dblClick(screen.getByText('테스트 할 일'))

    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '변경된 텍스트')
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument()
  })

  test('삭제 버튼이 렌더링된다', () => {
    render(<Wrapper todo={mockTodo} />)
    expect(screen.getByLabelText('삭제')).toBeInTheDocument()
  })
})
