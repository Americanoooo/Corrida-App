import { Link, useNavigate } from "react-router-dom";

function Navbar(){
    const navigate= useNavigate();

    function logout(){
        localStorage.removeItem('token')
        navigate('/login')
    }

    return(
        <nav className="bg-white shadow px-10 py-3 h-20 flex items-center justify-between">
            <div className="flex gap-10">
                <Link to='/motos' className="hover:text-blue-600">Motos</Link>
                <Link to='/' className="hover:text-blue-600">Corridas</Link>
            </div>
            <button onClick={logout} className="text-red-600 hover:text-red-700 cursor-pointer">Sair</button>
        </nav>
    )
}
export default Navbar;