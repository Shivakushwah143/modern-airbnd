"use client";
import { useEffect, useRef } from "react";
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (open) {
      el?.showModal();
      document.body.style.overflow = "hidden";
    } else el?.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
