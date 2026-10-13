import { createContext, useContext, useState, useCallback } from "react";
import { IconCheckCircle, IconAlertCircle } from "../components/ui/icons";

type Toast = {mensagem: string; tipo: "erro" | "ok"};

const ToastContext = createContext<(mensagem: string, tipo: "erro" | "ok") => void>(() => {});

export function useToast(){
    return useContext(ToastContext);
}

export function ToastProvider({children} : {children: React.ReactNode}) {
    const [toast, setToast] = useState<Toast | null>(null);

    const mostrarToast = useCallback((mensagem: string, tipo: "erro" | "ok")=> {
        setToast({mensagem, tipo});

        setTimeout(()=> setToast(null), 3000);
    }, []);

    return(
        <ToastContext.Provider value={mostrarToast}>
            {children}
            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex items-center gap-2 px-4 py-3 rounded-controle shadow-lg text-white text-sm motion-safe:animate-slide-up ${toast.tipo ==="erro" ? "bg-erro" : "bg-sucesso"}`}
                >
                    {toast.tipo === "erro" ? (
                        <IconAlertCircle className="h-4 w-4 shrink-0" />
                    ) : (
                        <IconCheckCircle className="h-4 w-4 shrink-0" />
                    )}
                    {toast.mensagem}
                </div>
            )}
        </ToastContext.Provider>
    )
}