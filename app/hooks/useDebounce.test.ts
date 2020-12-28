import { renderHook, act } from '@testing-library/react-hooks'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    // tell jest to mock all timeout functions
    jest.useFakeTimers('modern');
  })

  it('returns initial value', () => {
    const { result } = renderHook(() => useDebounce('', 200))

    expect(result.current[0]).toBe('');
  })

  it('does not update the value before the delay', () => {
    const { result } = renderHook(() => useDebounce('', 200))

    act(() => {
      result.current[1]('h')
      jest.advanceTimersByTime(199);
    })
    
    expect(result.current[0]).toBe('');
  })

  it('updates the value after the delay', () => {
    const { result } = renderHook(() => useDebounce('', 200))

    act(() => {
      result.current[1]('hi')
      jest.advanceTimersByTime(200);
    })

    expect(result.current[0]).toBe('hi');
  })

  it('resets the delay on value change', () => {
    const { result } = renderHook(() => useDebounce('', 200))

    act(() => {
      jest.advanceTimersByTime(100);
      result.current[1]('hi')
      jest.advanceTimersByTime(110);
    })

    expect(result.current[0]).toBe('');
  })
})