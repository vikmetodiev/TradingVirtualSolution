import React, { useEffect } from "react";

export function useOnOutsideClick(
  ref: React.MutableRefObject<HTMLElement | null>,
  handler: (event: React.SyntheticEvent<HTMLElement>) => void
) {
  useEffect(() => {
    const listener: any = (event: React.SyntheticEvent<HTMLElement>) => {
      ref.current;
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
