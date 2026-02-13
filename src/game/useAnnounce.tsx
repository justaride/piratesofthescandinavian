import { useCallback, useRef } from 'react';

export function useAnnounce() {
  const ref = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (!ref.current) {
      return;
    }

    ref.current.textContent = '';

    window.requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.textContent = message;
      }
    });
  }, []);

  const AnnouncerRegion = () => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, AnnouncerRegion };
}
