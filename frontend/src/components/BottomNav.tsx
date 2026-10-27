import { Link, useLocation } from "react-router-dom";
import { IconRoute, IconBike } from "./ui/icons";

const itens = [
  { to: "/", label: "Corridas", Icon: IconRoute },
  { to: "/motos", label: "Motos", Icon: IconBike },
];

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-superficie/95 backdrop-blur border-t border-borda pb-safe">
      <div className="flex items-stretch justify-around">
        {itens.map(({ to, label, Icon }) => {
          const ativo = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 min-h-14 text-xs font-medium transition-colors duration-150 ${
                ativo ? "text-marca" : "text-texto-secundario"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
