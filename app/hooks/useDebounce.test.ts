import { renderHook } from '@testing-library/react-hooks'

import { useDebounce } from './useDebounce'

// tell jest to mock all timeout functions
jest.useFakeTimers();

describe('useDebounce', () => {
  const props = {
    initialProps: { value: ''}
  };

  it('returns initial value', () => {
    const { result } = renderHook(({value }) => useDebounce(value, 500), props)

    expect(result.current).toBe('');
  })

  it('does not update the value before the delay', () => {
    const { result, rerender } = renderHook(({value}) => useDebounce(value, 500), props)

    rerender({ value: 'h'})
    jest.advanceTimersByTime(499);
    
    expect(result.current).toBe('');
  })

  it('updates the value after the delay', () => {
    const { result, rerender } = renderHook(({value}) => useDebounce(value, 500), props)

    rerender({ value: 'hi'});
    jest.advanceTimersByTime(500);

    expect(result.current).toBe('hi');
  })

  it('resets the delay on value change', () => {
    const { result, rerender } = renderHook(({value}) => useDebounce(value, 500), props)

    jest.advanceTimersByTime(250);
    rerender({ value: 'h'})
    jest.advanceTimersByTime(499);
    
    expect(result.current).toBe('');
  })
})