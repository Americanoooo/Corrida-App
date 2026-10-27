import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-marca text-white hover:bg-marca-hover active:bg-marca-active",
  secondary:
    "bg-superficie text-texto-secundario border border-borda hover:bg-slate-50 active:bg-slate-100",
  danger: "bg-erro text-white hover:bg-erro-hover active:bg-erro-active",
  ghost: "bg-transparent text-texto-secundario hover:bg-slate-100 active:bg-slate-200",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", loading = false, disabled, className = "", children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-controle px-4 py-3 min-h-12 font-medium shadow-sm transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
