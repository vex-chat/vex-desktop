import { useState, useCallback } from 'react';
import debounce from "lodash/debounce";

export function useDebounce<T>(value: T, delay: number) {
  const [state, setState] = useState(value);

  const setDebouncedState = (_val: T) => {
    _debounce(_val);
  };

  const _debounce = useCallback(
    debounce((_prop: T) => {
      console.log("updating input");
      setState(_prop);
    }, delay),
    []
  );

  return [state, setDebouncedState] as const;
  }