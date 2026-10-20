"use client";
import { useEffect, useRef } from "react";
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  id,
  modal = true,
  showCloseButton = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  modal?: boolean;
  showCloseButton?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (open) {
      if (modal) el?.showModal();
      else el?.show();
      document.body.style.overflow = "hidden";
    } else el?.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, modal]);
  useEffect(() => {
    if (!open || modal) return;
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || ref.current?.contains(target)) return;
      if (target.closest("[aria-controls]")?.getAttribute("aria-controls") === id) return;
      onClose();
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open, modal, id, onClose]);
  return (
    <dialog
      ref={ref}
      className={className}
      id={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        {showCloseButton && <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>}
      </div>
      {children}
    </dialog>
  );
}
