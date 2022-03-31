import React, { ReactNode, useEffect, useRef } from "react";
import { useOnOutsideClick } from "../../hooks/useOnOutsideClick";

interface Props {
  children?: ReactNode;
  title?: string;
  onClose: () => void;
  open: boolean;
}

export default function Modal({ children, open, title, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  useOnOutsideClick(backdropRef, () => {
    onClose();
  });

  useEffect(() => {
    const body = document.querySelector("body");
    if (open) {
      backdropRef.current?.classList.add("open");
      if (body) body.style.overflowY = "hidden";
    } else {
      backdropRef.current?.classList.remove("open");
      if (body) body.style.overflowY = "auto";
    }
    return () => {
      if (body) body.style.overflowY = "auto";
    };
  }, [open]);

  return (
    <div className="modal--backdrop" ref={backdropRef}>
      <div className="modal--wrapper">
        <div className="modal--title">
          <h4>{title ?? ""}</h4>
          <button
            onClick={() => {
              onClose();
            }}
          >
            &times;
          </button>
        </div>
        <div className="modal--body">{children}</div>
      </div>
    </div>
  );
}
