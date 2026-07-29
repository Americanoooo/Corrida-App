import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


function Layout(){
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="px-4 sm:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
export default Layout;
