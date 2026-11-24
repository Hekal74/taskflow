import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  message: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastRef = useRef<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    if (
      toastRef.current?.message === message &&
      toastRef.current.variant === variant
    ) {
      return;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    const nextToast = { message, variant };
    toastRef.current = nextToast;
    setToast(nextToast);
    timeoutRef.current = setTimeout(() => {
      toastRef.current = null;
      timeoutRef.current = null;
      setToast(null);
    }, 3500);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return { toast, showToast };
}
