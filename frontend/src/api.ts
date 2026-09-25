import { ApiError } from "./Erros/ApiError";

const API_URL = import.meta.env.VITE_API_URL;
        if(!API_URL){
            console.error('API_URL Não configurada')
        }
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token')

    let res: Response
    try {
        res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        })
    } catch (err: unknown) {
        throw new ApiError(0, 'Não foi possível conectar ao servidor.')
    }

    if (res.status === 401 && !endpoint.includes('/usuario/login') && !endpoint.includes('/usuario/cadastrar')) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        throw new ApiError(401, 'Sessão expirada')
    }

    let data
    try {
        data = await res.json()
    } catch (err: unknown) {
        throw new ApiError(res.status, 'Resposta inválida do servidor.')
    }

    if (!res.ok) {
        throw new ApiError(res.status, data?.error || data.message || 'Erro desconhecido. Tente novamente.')
    }

    return data
}