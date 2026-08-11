import { createContext, useContext, useState, useCallback } from "react";

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
                <div className={`fixed top-6 left-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.tipo ==="erro" ? "bg-red-600" : "bg-green-600"}`}>
                    {toast.mensagem}
                </div>
            )}
        </ToastContext.Provider>
    )
}