import { Link, useNavigate } from "react-router-dom";

function Navbar(){
    const navigate= useNavigate();

    function logout(){
        localStorage.removeItem('token')
        navigate('/login')
    }

    return(
        <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-8 py-3 h-16 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 sm:gap-8">
                <Link to="/">
                
                <span className="hidden sm:flex items-center gap-2 font-bold text-slate-900 mr-4">
                    <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">CA</span>
                    CorridaApp
                </span>
                </Link>
                <div className="flex gap-1 sm:gap-2">
                    <Link to='/motos' className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition duration-200">Motos</Link>
                    <Link to='/' className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition duration-200">Corridas</Link>
                </div>
            </div>
            <button onClick={logout} className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition duration-200 cursor-pointer">Sair</button>
        </nav>
    )
}
export default Navbar;
