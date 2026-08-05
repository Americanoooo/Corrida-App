import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { formatarMoeda } from "../utils/FormatarMoeda";
import { ApiError } from "../Erros/ApiError";

interface Moto {
  id: number;
  modelo: string;
  km_litro: number;
}
interface Corrida {
  id: number;
  modelo: string;
  kms_rodados: number;
  receita: number;
  lucro_real: number;
  data: number;
}

function Corridas() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [moto_id, setMotoId] = useState("");
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [kmsRodados, setKmsRodados] = useState("");
  const [receita, setReceita] = useState("");
  const [gasolina, setGasolina] = useState("");
      const hoje = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(hoje);
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motoCorridaFiltro, setMotoCorridaFiltro]=useState('')
  const [carregando, setCarregando]=useState(true)



    const corridasFiltradas = motoCorridaFiltro
    ? corridas.filter((c)=> c.modelo ===motoCorridaFiltro)
    :corridas

  const totalLucro = corridasFiltradas.reduce((ac, c) => ac + Number(c.lucro_real), 0);

  useEffect(() => {
    async function buscarMotos() {
      try {
        const todasMotos = await apiFetch(`/motos`);
        setMotos(todasMotos);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar motos";
      }
    }
    buscarMotos();
  }, []);

  async function buscarCorridas(inicio?: string, fim?: string) {
    try {
      let url = "/corridas";
      if (inicio && fim) {
        url += `?inicio=${inicio}&fim=${fim}`;
      }

      const data = await apiFetch(url);
      setCorridas(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao buscar motos";
    }finally{
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarCorridas(inicio, fim);
  }, [inicio, fim]);

  async function handleRegistrar() {
    if (!moto_id) {
      return setErro("Escolha a moto primeiro");
    }
    if (!gasolina || !receita || !kmsRodados || !data) {
      return setErro("Preencha todos os campos");
    }
    try {
      await apiFetch(`/motos/${moto_id}/corridas`, {
        method: "POST",
        body: JSON.stringify({
          kms_rodados: kmsRodados,
          receita: receita.replace(",", "."),
          gasolina_congelada: gasolina.replace(",", "."),
          data,
        }),
      });
      setErro("");
      setKmsRodados("");
      setReceita("");
      setGasolina("");
    } catch (err: unknown) {
      if(err instanceof ApiError && err.status ===400){
        setErro('Nenhuma peça cadastrada')
      }
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar corridas";
    }
    buscarCorridas();
  }

  function filtrarMes() {
    const agora = new Date();
    const inicioH = new Date(agora.getFullYear(), agora.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const fimH = new Date().toISOString().split("T")[0];
    setInicio(inicioH);
    setFim(fimH);
  }

  function filtrarHoje() {
  const hoje = new Date().toISOString().split("T")[0];
setInicio(hoje);
setFim(hoje);
  }

  function filtrarSemana() {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const inicioH = seteDiasAtras.toISOString().split("T")[0];
  const hoje = new Date().toISOString().split("T")[0];   // ← hoje, não dia 1
  setInicio(inicioH);
  setFim(hoje);
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Corridas</h1>
        <p className="text-slate-500 mt-1">Registre corridas e acompanhe seu lucro</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Cadastrar nova corrida</h2>
          <select
            className="select-field sm:w-56"
            value={moto_id}
            onChange={(e) => setMotoId(e.target.value)}
          >
            <option value={""}>Escolha uma moto</option>
            {motos.map((moto) => (
              <option key={moto.id} value={moto.id}>
                {moto.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="input-field"
            placeholder="Kms Rodados"
            value={kmsRodados}
            onChange={(e) => setKmsRodados(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Receita"
            type="number"
            value={receita}
            onChange={(e) => setReceita(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Preço da gasolina"
            type="number"
            value={gasolina}
            onChange={(e) => setGasolina(e.target.value)}
          />
        </div>

        <input
          className="input-field mt-4 sm:w-52"
          type="date"
          value={data}
          max={hoje}
          onChange={(e) => setData(e.target.value)}
        />

        

        <button
          className="btn-primary mt-5 mx-auto w-full sm:w-auto sm:px-10"
          onClick={handleRegistrar}
        >
          Cadastrar
        </button>
        {erro && (
          <p className="text-sm text-red-600 text-center mt-4">{erro}</p>
        )}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Corridas realizadas
          </h2>

          <select
            className="select-field sm:w-56"
            value={motoCorridaFiltro}
            onChange={(e) => setMotoCorridaFiltro(e.target.value)}
          >
            <option value="">Todas as motos</option>
            {motos.map((moto) => (
              <option key={moto.id} value={moto.modelo}>
                {moto.modelo}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-5 border-t border-slate-100">

          <div className="flex flex-wrap gap-2 items-center">

            <span className="text-sm font-medium text-slate-500 mr-1">Filtrar:</span>

            <button
              className="btn-secondary px-3! py-1.5! text-sm"
              onClick={filtrarHoje}
            >
              Hoje
            </button>
            <button
            onClick={filtrarSemana}
            className="btn-secondary px-3! py-1.5! text-sm">
              Semana
            </button>
            <button
            onClick={filtrarMes}
            className="btn-secondary px-3! py-1.5! text-sm">
              Mês
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-500">Início:</span>
            <input
              className="input-field py-1.5! w-auto!"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
            <span className="font-medium text-slate-500">Fim:</span>
            <input
              className="input-field py-1.5! w-auto!"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>


        </div>
        
         

        <div className="flex flex-col mt-4 max-h-120 overflow-y-auto">
          {carregando ?(
            <p className="text-slate-500 text-center py-10">Carregando...</p>
          ) : corridasFiltradas.length ===0 ?(
            <p className="text-slate-500 text-center py-10">Nenhuma corrida encontrada</p>
            )
            : (
            <>
              <div className="hidden sm:grid sm:grid-cols-5 gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <span>Moto</span>
                <span>Data</span>
                <span>Kms rodados</span>
                <span>Receita</span>
                <span className="text-right">Lucro</span>
              </div>
              {corridasFiltradas.map((c) => (
              <div key={c.id} className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-1 px-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition duration-150 text-sm">
                <span className="text-slate-800 font-medium">{c.modelo}</span>
                <span className="text-slate-500">{new Date(c.data).toLocaleDateString("pt-BR")}</span>
                <span className="text-slate-500">{c.kms_rodados} Km</span>
                <span className="text-slate-500">{formatarMoeda(c.receita)}</span>
                <span className={`sm:text-right font-semibold ${Number(c.lucro_real) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatarMoeda(c.lucro_real)}
                </span>
              </div>
            ))}
            </>
          )}

        </div>


        {carregando ? (
          <>
          </>
        ) : corridas.length ===0 ? (
          <>
          </>
        ):(
        <div className="flex items-center justify-end gap-2 mt-4 pt-5 border-t border-slate-200">
          <span className="text-slate-500 font-medium">Lucro total:</span>
          <span className={`text-xl font-bold ${totalLucro >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatarMoeda(totalLucro)}
          </span>
        </div>
        )}

      </div>
    </div>
  );
}
export default Corridas;
