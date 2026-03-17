import { useState, useEffect, useRef, useCallback } from 'react';

/** Debounce hook */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

/** Click outside hook */
export const useClickOutside = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  return ref;
};

/** Toggle hook */
export const useToggle = (initial = false) => {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState(prev => !prev), []);
  const setOn = useCallback(() => setState(true), []);
  const setOff = useCallback(() => setState(false), []);
  return [state, toggle, setOn, setOff];
};
