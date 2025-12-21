// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useState, useEffect, useCallback, useRef } from "react";

// <== USE DEBOUNCE HOOK ==>
export function useDebounce<T>(value: T, delay: number = 300): T {
  // STATE FOR DEBOUNCED VALUE
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // EFFECT TO UPDATE DEBOUNCED VALUE
  useEffect(() => {
    // SET TIMEOUT TO UPDATE DEBOUNCED VALUE
    const timer = setTimeout(() => {
      // UPDATE DEBOUNCED VALUE
      setDebouncedValue(value);
    }, delay);
    // CLEANUP FUNCTION TO CLEAR TIMEOUT
    return () => {
      // CLEAR TIMEOUT
      clearTimeout(timer);
    };
  }, [value, delay]);
  // RETURN DEBOUNCED VALUE
  return debouncedValue;
}

// <== USE DEBOUNCED CALLBACK HOOK ==>
export function useDebouncedCallback<
  T extends (...args: Parameters<T>) => ReturnType<T>
>(callback: T, delay: number = 300): (...args: Parameters<T>) => void {
  // REF TO STORE TIMEOUT
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // REF TO STORE LATEST CALLBACK
  const callbackRef = useRef(callback);
  // UPDATE CALLBACK REF ON CHANGE
  useEffect(() => {
    // UPDATE CALLBACK REF
    callbackRef.current = callback;
  }, [callback]);
  // CLEANUP ON UNMOUNT
  useEffect(() => {
    // CLEANUP ON UNMOUNT
    return () => {
      // CLEAR TIMEOUT
      if (timeoutRef.current) {
        // CLEAR TIMEOUT
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  // RETURN DEBOUNCED CALLBACK
  return useCallback(
    (...args: Parameters<T>) => {
      // CLEAR EXISTING TIMEOUT
      if (timeoutRef.current) {
        // CLEAR TIMEOUT
        clearTimeout(timeoutRef.current);
      }
      // SET NEW TIMEOUT
      timeoutRef.current = setTimeout(() => {
        // CALL CALLBACK
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
