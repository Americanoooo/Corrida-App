import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { formatarMoeda } from "../utils/FormatarMoeda";
import { capitalizar } from "../utils/Capitalizar";


interface MotoPeca {
  id: number;
  nome: string;
  custo: number;
  intervalo_km: number;
}

interface Peca {
  id: number;
  nome: string;
}

function MotoPecas() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]=useState('')
  const { motoId } = useParams();
  const [pecas, setPecas] = useState<MotoPeca[]>([]);
  const [catalogo, setCatalogo] = useState<Peca[]>([]);
  const [pecaId, setPecaId] = useState("");
  const [custo, setCusto] = useState("");
  const [intervaloKm, setIntervaloKm] = useState("");

  async function buscarPecas() {
    try {
      const data = await apiFetch(`/motos/${motoId}/pecas`);
      setPecas(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao buscar peças";
      }

  }

  async function handleVincular() {
    if(!pecaId || !custo ||!intervaloKm) return setErro('Preencha todos os campos')
    try {
      await apiFetch(`/motos/${motoId}/pecas`, {
        method: "POST",
        body: JSON.stringify({
          peca_id: pecaId,
          custo,
          intervalo_km: intervaloKm,
        }),
      });
      buscarPecas();
      setCusto('')
      setIntervaloKm('')
      setErro('')

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar peças";
        setErro(message)  
      }
  }

  useEffect(() => {
    buscarPecas();
    buscarCatalogo();

    async function buscarCatalogo() {
      try {
        const data = await apiFetch("/pecas");
        setCatalogo(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar peças";
        } finally {
        setCarregando(false);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          to="/motos"
          className="btn-secondary w-fit"
        >
          ← Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Peças da moto</h1>
        <p className="text-slate-500 mt-1">Gerencie as peças vinculadas a esta moto</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Vincular peça</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="select-field"
            value={pecaId}
            onChange={(e) => setPecaId(e.target.value)}
          >
            <option
            value={""}>Escolha uma peça</option>
            {catalogo.map((peca) => (
              <option
              key={peca.id} value={peca.id}
              >
                {capitalizar(peca.nome)}
              </option>
            ))}
          </select>

          <input
          className="input-field"
           placeholder="Custo"
           type="number"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
          />

          <input
           className="input-field"
            placeholder="Quantos Km"
            type="number"
            value={intervaloKm}
            onChange={(e) => setIntervaloKm(e.target.value)}
          />
          <button
            onClick={handleVincular}
            className="btn-primary"
          >
            Cadastrar
          </button>
        </div>
        {erro && (
          <p className="text-sm text-red-600 text-center mt-4">{erro}</p>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Peças cadastradas
        </h2>

        {carregando ? (
          <p className="text-slate-500 text-center py-10">Carregando...</p>
        ) : pecas.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Nenhuma peça cadastrada</p>
        ) : (
          <div className="flex flex-col max-h-80 overflow-y-auto">
            <div className="hidden sm:grid sm:grid-cols-3 gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <span>Peça</span>
              <span>Custo / Intervalo</span>
              <span>Custo por Km</span>
            </div>
            {pecas.map((peca) => (
              <div key={peca.id} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition duration-150 text-sm">
                <h2 className="capitalize font-semibold text-slate-800" >{peca.nome}</h2>
                <h3 className="capitalize text-slate-600">
                  {formatarMoeda(peca.custo)} - {peca.intervalo_km}Km
                </h3>
                <p className="capitalize text-slate-600">
                  Custo por Km{" "}
                  {formatarMoeda(
                    Number(peca.custo) / Number(peca.intervalo_km),
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default MotoPecas;
