import { Link, useNavigate, useLocation } from "react-router-dom";
import { IconLogOut } from "./ui/icons";

const links = [
  { to: "/", label: "Corridas" },
  { to: "/motos", label: "Motos" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-20 bg-faixa text-faixa-texto px-4 sm:px-8 py-3 h-16 flex items-center justify-between pt-safe">
      <div className="flex items-center gap-2 sm:gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-controle bg-white text-faixa flex items-center justify-center text-sm font-bold">
            L
          </span>
          <span className="hidden sm:inline font-bold text-faixa-texto">Lucrei</span>
        </Link>
        <div className="hidden sm:flex gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-controle text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.to
                  ? "bg-white/15 text-faixa-texto"
                  : "text-faixa-texto-secundario hover:text-faixa-texto hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-2 rounded-controle text-sm font-medium text-faixa-texto-secundario hover:text-faixa-texto hover:bg-white/10 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-faixa"
      >
        <IconLogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </nav>
  );
}

export default Navbar;
