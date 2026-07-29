import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
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
        console.log(message)
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
      
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao buscar peças";
        console.log(message)
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
          console.log(message)
        } finally {
        setCarregando(false);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="flex flex-col  gap-10 ">
        <Link
          to="/motos"
          className="bg-slate-400 text-white w-16 p-2 text-center rounded-xl shadow"
        >
          Voltar
        </Link>

        <div className="flex flex-col min-w-3xl  gap-6 min-h-56  mx-auto p-6 bg-white rounded-xl">
          <div className="flex justify-around items-start gap-5">
          <select
            className="cursor-pointer"
            value={pecaId}
            onChange={(e) => setPecaId(e.target.value)}
          >
            <option 
            className="font-semibold"
            value={""}>Escolha uma peça</option>
            {catalogo.map((peca) => (
              <option 
              className="font-semibold"
              key={peca.id} value={peca.id}
              >
                {capitalizar(peca.nome)}
              </option>
            ))}
          </select>

          <input 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"
           placeholder="Custo"
           type="number"
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
          />
          
           
          

          <input
           className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"
            placeholder="Quantos Km"
            type="number"
            value={intervaloKm}
            onChange={(e) => setIntervaloKm(e.target.value)}
          />
          <button
            onClick={handleVincular}
            className="cursor-pointer bg-blue-600 text-white px-2 h-10  rounded"
          >
            Cadastrar
          </button>
           </div>
            {erro && (
              <p className="text-center text-red-500 ">{erro}</p>
            )}
        </div>
        
        <div className=" h-56 min-w-3xl flex flex-col  p-2 bg-white w-1/2 md:w-1/4 rounded-xl shadow overflow-y-auto ">
          <h1 className="text-center text-xl font-semibold">
            Peças cadastradas
          </h1>

          {carregando ? (
            <h2>Carregando...</h2>
          ) : pecas.length === 0 ? (
            <h2 className="text-center mt-5">Nenhuma peça cadastrada</h2>
          ) : (
            pecas.map((peca) => (
              <div key={peca.id} className="grid grid-cols-3 gap-4 py-2 border-b text-large ">
                <h2 className="capitalize font-semibold" >{peca.nome}</h2>
                <h3 className="capitalize">
                  {formatarMoeda(peca.custo)} - {peca.intervalo_km}Km
                </h3>
                <p className="capitalize">
                  Custo por Km{" "}
                  {formatarMoeda(
                    Number(peca.custo) / Number(peca.intervalo_km),
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default MotoPecas;
