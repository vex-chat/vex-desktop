import { renderHook } from '@testing-library/react-hooks'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  it('returns initial value', () => {
    const { result } = renderHook(() => useDebounce('hai', 500))

    expect(result.current).toBe('hai')
  })
})