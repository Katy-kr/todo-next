import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider } from '@/app/context/TodoContext'
import TodoInput from '@/app/components/TodoInput'

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() },
})
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false }) })

function Wrapper() {
  return <TodoProvider><TodoInput /></TodoProvider>
}

describe('TodoInput 컴포넌트', () => {
  test('입력 후 추가 버튼 클릭 시 input이 초기화된다', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')

    await userEvent.type(input, '새로운 할 일')
    expect(input).toHaveValue('새로운 할 일')

    await userEvent.click(screen.getByLabelText('추가'))
    expect(input).toHaveValue('')
  })

  test('Enter 키로 할 일을 추가할 수 있다', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')

    await userEvent.type(input, '엔터로 추가{Enter}')
    expect(input).toHaveValue('')
  })

  test('빈 입력은 추가되지 않고 input이 유지된다', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')

    await userEvent.click(screen.getByLabelText('추가'))
    expect(input).toHaveValue('')
  })

  test('우선순위를 선택할 수 있다', async () => {
    render(<Wrapper />)
    const select = screen.getByLabelText ? screen.getByRole('combobox') : screen.getByDisplayValue('보통')

    await userEvent.selectOptions(select, 'high')
    expect(select).toHaveValue('high')

    await userEvent.selectOptions(select, 'low')
    expect(select).toHaveValue('low')
  })

  test('추가 후 우선순위가 기본값(보통)으로 초기화된다', async () => {
    render(<Wrapper />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')
    const select = screen.getByRole('combobox')

    await userEvent.selectOptions(select, 'high')
    await userEvent.type(input, '테스트{Enter}')

    expect(select).toHaveValue('normal')
  })
})
