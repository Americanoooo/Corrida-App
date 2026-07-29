import { Navigate } from "react-router-dom";

function RotaProtegida({children}: {children: React.ReactNode}){
    const token = localStorage.getItem('token')

    if(!token) {
        return <Navigate to ='/login' replace />
    }
    return children
}
export default RotaProtegida;