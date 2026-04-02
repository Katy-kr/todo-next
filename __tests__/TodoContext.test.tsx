import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider, useTodo } from '@/app/context/TodoContext'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'matchMedia', {
  value: () => ({ matches: false }),
})

// Context 값을 DOM에 노출하는 헬퍼 컴포넌트
function TodoConsumer() {
  const {
    filteredTodos, activeCount, completedCount, filter, dark,
    addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, setFilter, toggleDark,
  } = useTodo()

  return (
    <div>
      <span data-testid="active-count">{activeCount}</span>
      <span data-testid="completed-count">{completedCount}</span>
      <span data-testid="filter">{filter}</span>
      <span data-testid="dark">{String(dark)}</span>
      <ul>
        {filteredTodos.map(t => (
          <li key={t.id} data-testid={`todo-${t.id}`}>
            <span data-testid={`text-${t.id}`}>{t.text}</span>
            <span data-testid={`done-${t.id}`}>{String(t.done)}</span>
            <span data-testid={`priority-${t.id}`}>{t.priority}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo('할 일 1', 'normal')}>add-normal</button>
      <button onClick={() => addTodo('할 일 2', 'high')}>add-high</button>
      <button onClick={() => addTodo('', 'normal')}>add-empty</button>
      <button onClick={() => toggleTodo(1)}>toggle-1</button>
      <button onClick={() => deleteTodo(1)}>delete-1</button>
      <button onClick={() => updateTodo(1, '수정된 할 일')}>update-1</button>
      <button onClick={() => clearCompleted()}>clear-completed</button>
      <button onClick={() => setFilter('active')}>filter-active</button>
      <button onClick={() => setFilter('completed')}>filter-completed</button>
      <button onClick={() => setFilter('all')}>filter-all</button>
      <button onClick={() => toggleDark()}>toggle-dark</button>
    </div>
  )
}

function Wrapper() {
  return (
    <TodoProvider>
      <TodoConsumer />
    </TodoProvider>
  )
}

beforeEach(() => {
  localStorageMock.clear()
})

describe('TodoContext — CRUD', () => {
  test('할 일을 추가하면 activeCount가 증가한다', async () => {
    render(<Wrapper />)
    expect(screen.getByTestId('active-count').textContent).toBe('0')

    await userEvent.click(screen.getByText('add-normal'))
    expect(screen.getByTestId('active-count').textContent).toBe('1')
    expect(screen.getByTestId('text-1').textContent).toBe('할 일 1')
  })

  test('빈 문자열은 추가되지 않는다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-empty'))
    expect(screen.getByTestId('active-count').textContent).toBe('0')
  })

  test('할 일을 토글하면 done 상태가 바뀐다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    expect(screen.getByTestId('done-1').textContent).toBe('false')

    await userEvent.click(screen.getByText('toggle-1'))
    expect(screen.getByTestId('done-1').textContent).toBe('true')
    expect(screen.getByTestId('active-count').textContent).toBe('0')
    expect(screen.getByTestId('completed-count').textContent).toBe('1')
  })

  test('할 일을 삭제하면 목록에서 사라진다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    expect(screen.getByTestId('todo-1')).toBeInTheDocument()

    await userEvent.click(screen.getByText('delete-1'))
    expect(screen.queryByTestId('todo-1')).not.toBeInTheDocument()
  })

  test('할 일 텍스트를 수정할 수 있다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    expect(screen.getByTestId('text-1').textContent).toBe('할 일 1')

    await userEvent.click(screen.getByText('update-1'))
    expect(screen.getByTestId('text-1').textContent).toBe('수정된 할 일')
  })

  test('완료된 항목을 일괄 삭제한다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    await userEvent.click(screen.getByText('add-high'))
    await userEvent.click(screen.getByText('toggle-1'))

    expect(screen.getByTestId('active-count').textContent).toBe('1')
    await userEvent.click(screen.getByText('clear-completed'))
    expect(screen.getByTestId('active-count').textContent).toBe('1')
    expect(screen.getByTestId('completed-count').textContent).toBe('0')
    expect(screen.queryByTestId('todo-1')).not.toBeInTheDocument()
  })
})

describe('TodoContext — 우선순위 정렬', () => {
  test('높음 → 보통 → 낮음 순으로 정렬된다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal')) // id=1, normal
    await userEvent.click(screen.getByText('add-high'))   // id=2, high

    const items = screen.getAllByRole('listitem')
    // high(id=2)가 normal(id=1)보다 앞에 와야 함
    expect(items[0]).toHaveAttribute('data-testid', 'todo-2')
    expect(items[1]).toHaveAttribute('data-testid', 'todo-1')
  })
})

describe('TodoContext — 필터', () => {
  test('active 필터는 미완료 항목만 보여준다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    await userEvent.click(screen.getByText('add-high'))
    await userEvent.click(screen.getByText('toggle-1'))

    await userEvent.click(screen.getByText('filter-active'))
    expect(screen.queryByTestId('todo-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('todo-2')).toBeInTheDocument()
  })

  test('completed 필터는 완료 항목만 보여준다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    await userEvent.click(screen.getByText('add-high'))
    await userEvent.click(screen.getByText('toggle-1'))

    await userEvent.click(screen.getByText('filter-completed'))
    expect(screen.getByTestId('todo-1')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-2')).not.toBeInTheDocument()
  })

  test('all 필터는 모든 항목을 보여준다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))
    await userEvent.click(screen.getByText('add-high'))
    await userEvent.click(screen.getByText('toggle-1'))
    await userEvent.click(screen.getByText('filter-active'))

    await userEvent.click(screen.getByText('filter-all'))
    expect(screen.getByTestId('todo-1')).toBeInTheDocument()
    expect(screen.getByTestId('todo-2')).toBeInTheDocument()
  })
})

describe('TodoContext — 다크모드', () => {
  test('toggleDark로 dark 상태가 전환된다', async () => {
    render(<Wrapper />)
    expect(screen.getByTestId('dark').textContent).toBe('false')

    await userEvent.click(screen.getByText('toggle-dark'))
    expect(screen.getByTestId('dark').textContent).toBe('true')

    await userEvent.click(screen.getByText('toggle-dark'))
    expect(screen.getByTestId('dark').textContent).toBe('false')
  })
})

describe('TodoContext — localStorage 영속성', () => {
  test('추가한 할 일이 localStorage에 저장된다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('add-normal'))

    const stored = JSON.parse(localStorageMock.getItem('todo-next-data') ?? '{}')
    expect(stored.todos).toHaveLength(1)
    expect(stored.todos[0].text).toBe('할 일 1')
  })

  test('localStorage 데이터를 마운트 시 불러온다', async () => {
    localStorageMock.setItem('todo-next-data', JSON.stringify({
      todos: [{ id: 1, text: '저장된 할 일', done: false, priority: 'normal', createdAt: Date.now() }],
      nextId: 2,
    }))

    render(<Wrapper />)
    expect(await screen.findByTestId('text-1')).toHaveTextContent('저장된 할 일')
    expect(screen.getByTestId('active-count').textContent).toBe('1')
  })
})
