import { useCallback, useState, useEffect } from 'react';
import { FormStateHook, AsyncStateHook } from './sidebar-types';

export function useFormState<T>(
  initialData: T,
  validationFn?: (data: T) => boolean
): FormStateHook<T> {
  const [data, setData] = useState<T>(initialData);
  const [initialState] = useState<T>(initialData);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const updateData = useCallback((newData: Partial<T>) => {
    setData(current => ({ ...current, ...newData }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
    setIsDirty(false);
  }, [initialData]);

  useEffect(() => {
    if (validationFn) {
      setIsValid(validationFn(data));
    }
    setIsDirty(JSON.stringify(data) !== JSON.stringify(initialState));
  }, [data, validationFn, initialState]);

  return {
    data,
    updateData,
    resetData,
    isValid,
    isDirty,
  };
}

export function useAsyncState<T>(
  initialData: T | null = null
): AsyncStateHook<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setToggle = useCallback((newValue: boolean) => setValue(newValue), []);
  
  return [value, toggle, setToggle];
}

export const createFormReducer = <T>(initialState: T) => {
  return (state: T, action: { type: 'UPDATE' | 'RESET'; payload?: Partial<T> }): T => {
    switch (action.type) {
      case 'UPDATE':
        return { ...state, ...action.payload };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };
};