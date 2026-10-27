import type { ButtonHTMLAttributes } from "react";

function Fab({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`fixed z-30 right-5 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 h-14 w-14 rounded-full bg-marca text-white shadow-lg shadow-marca/30 flex items-center justify-center active:scale-95 motion-reduce:active:scale-100 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/50 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Fab;
