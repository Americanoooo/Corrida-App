import { ApiError } from "./Erros/ApiError";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}){
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}${endpoint}`,{
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {}),
            ...options.headers,
        },
    });
    if(res.status ===401 && !endpoint.includes('/usuario/login') && !endpoint.includes("/usuario/cadastrar")){
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error('Sessão expirada')
    }

    const data = await res.json();

        if(res.status === 404 && data.message === "Rota não encontrada"){
            console.error(`Rota não encontrada: ${endpoint}`);
            throw new ApiError(500, "Algo deu errado. Tente novamente.")
        }


    if(!res.ok){
        throw new ApiError (res.status ,data.error || data.message|| 'Algo deu errado. Tente novamente.')
    }
    return data;
}