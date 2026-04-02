import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider } from '@/app/context/TodoContext'
import TodoFilter from '@/app/components/TodoFilter'

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
})
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false }) })

function Wrapper() {
  return <TodoProvider><TodoFilter /></TodoProvider>
}

describe('TodoFilter 컴포넌트', () => {
  test('전체/미완료/완료 버튼이 렌더링된다', () => {
    render(<Wrapper />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('미완료')).toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  test('초기 선택 필터는 전체이다', () => {
    render(<Wrapper />)
    expect(screen.getByText('전체')).toHaveClass('text-[#5b7fff]')
  })

  test('미완료 버튼 클릭 시 활성화된다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('미완료'))
    expect(screen.getByText('미완료')).toHaveClass('text-[#5b7fff]')
    expect(screen.getByText('전체')).not.toHaveClass('text-[#5b7fff]')
  })

  test('완료 버튼 클릭 시 활성화된다', async () => {
    render(<Wrapper />)
    await userEvent.click(screen.getByText('완료'))
    expect(screen.getByText('완료')).toHaveClass('text-[#5b7fff]')
  })
})
