import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

function Layout() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-8 pb-24 sm:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
export default Layout;
