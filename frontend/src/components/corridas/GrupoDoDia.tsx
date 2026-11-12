import { formatarMoeda } from "../../utils/FormatarMoeda";
import { IconTrendUp, IconTrendDown } from "../ui/icons";

interface CorridaResumo {
  id: number;
  modelo: string;
  kms_rodados: number;
  receita: number;
  lucro_real: number;
  data: string;
}

interface GrupoDoDiaProps {
  rotulo: string;
  lucroDia: number;
  corridas: CorridaResumo[];
  onSelecionar: (corrida: CorridaResumo) => void;
}

function GrupoDoDia({ rotulo, lucroDia, corridas, onSelecionar }: GrupoDoDiaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-texto-secundario">{rotulo}</span>
        <span className={`text-sm font-semibold tabular-nums ${lucroDia >= 0 ? "text-lucro" : "text-prejuizo"}`}>
          {formatarMoeda(lucroDia)}
        </span>
      </div>
      <div className="card divide-y divide-borda overflow-hidden">
        {corridas.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelecionar(c)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm text-left cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40"
          >
            <div className="min-w-0">
              <p className="font-medium text-texto truncate">{c.modelo}</p>
              <p className="text-texto-secundario tabular-nums">
                {c.kms_rodados} km · {formatarMoeda(c.receita)}
              </p>
            </div>
            <span
              className={`flex items-center gap-1 font-semibold tabular-nums shrink-0 ${
                Number(c.lucro_real) >= 0 ? "text-lucro" : "text-prejuizo"
              }`}
            >
              {Number(c.lucro_real) >= 0 ? <IconTrendUp className="h-4 w-4" /> : <IconTrendDown className="h-4 w-4" />}
              {formatarMoeda(c.lucro_real)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GrupoDoDia;
