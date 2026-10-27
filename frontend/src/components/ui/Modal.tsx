import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 motion-safe:animate-fade-in"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="w-full sm:max-w-md card rounded-b-none sm:rounded-sheet p-6 motion-safe:animate-slide-up overscroll-contain max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo" className="text-lg font-semibold text-texto mb-4">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
