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
  const [data, setData] = useState("");
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motoCorridaFiltro, setMotoCorridaFiltro]=useState('')
  const [carregando, setCarregando]=useState(true)

    const hoje = new Date().toISOString().split("T")[0];

  
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
        console.log(message);
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
      console.log(message);
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
      setData("");
    } catch (err: unknown) {
      if(err instanceof ApiError && err.status ===400){
        setErro('Nenhuma peça cadastrada')
      }
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar corridas";
      console.log(message);
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-10  bg-slate-100">
      <div className="flex flex-col justify-center bg-white p-2 rounded-xl shadow min-h-48 min-w-3xl">
        <div className="flex justify-around">
          <h2 className="text-xl font-semibold ">Cadastrar novas corridas</h2>
          <select
            className="cursor-pointer"
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
        <div className="flex  w-72 gap-5 px-2 py-5">
          <input
          className="  px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"    
            placeholder="Kms Rodados"
            value={kmsRodados}
            onChange={(e) => setKmsRodados(e.target.value)}
          />
          <input
           className="  px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition" 
            placeholder="Receita"
            type="number"
            value={receita}
            onChange={(e) => setReceita(e.target.value)}
          />
          <input
           className="  px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition" 
            placeholder="Preço da gasolina"
            type="number"
            value={gasolina}
            onChange={(e) => setGasolina(e.target.value)}
          />
         
        </div>
         <input
         className="  w-1/4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition cursor-pointer"
            type="date"
            value={data}
            max={hoje}
            onChange={(e) => setData(e.target.value)}
          />
        {erro && (
          <p className="text-red-500 text-center">{erro}</p>
        )}
        <button
          className="bg-blue-700 text-white rounded-xl p-2 w-1/6 cursor-pointer mx-auto"
          onClick={handleRegistrar}
        >
          Cadastrar
        </button>
      </div>
      <div className=" flex flex-col py-3 bg-white mt-10 rounded-xl shadow min-h-110 min-w-3xl ">
         <h2 className="text-xl text-center font-semibold">
            Corridas realizadas
          </h2>

        <select
            className="cursor-pointer w-1/5 mx-auto mt-3"
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

        {carregando ? (
          <>
          </>
        ) : corridasFiltradas.length ===0 ? (
          <>
          </>
        )
        : (
        <div className="py-5 px-10">
         
          <div className="flex justify-around">
            <div className="flex gap-2 items-center">
            
                
              <h2 className="text-lg font-semibold">Filtrar:</h2>

              <button
                className="bg-blue-700 text-white rounded-xl p-2 w-1/3 cursor-pointer mx-auto"
                onClick={filtrarHoje}
              >
                Hoje
              </button>
              <button 
              onClick={filtrarSemana}
              className="bg-blue-700 text-white rounded-xl p-2 w-1/3 cursor-pointer mx-auto">
                Semana
              </button>
              <button 
              onClick={filtrarMes}
              className="bg-blue-700 text-white rounded-xl p-2 w-1/3 cursor-pointer mx-auto">
                Mês
              </button>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Inicio:</h2>
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
              <h2 className="text-lg font-semibold">Fim:</h2>
              <input
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          </div>
          

          
        </div>
        )
         }
      
        <div className="flex flex-col gap-5 px-10 max-h-120 overflow-y-auto">
          {carregando ?(
            <h1 className="text-xl text-center mt-10 font-semibold">Carregando...</h1>
          ) : corridasFiltradas.length ===0 ?(
            <h1 className="text-xl text-center mt-10 font-semibold">Nenhuma corrida encontrada</h1> ) 
            : ( corridasFiltradas.map((c) => (
            <div key={c.id} className="flex justify-around">
              <h2>Moto: {c.modelo}</h2>
            <h2 className="font-semibold text-lg">Lucro: {formatarMoeda(c.lucro_real)}</h2>
              <h2>Kms rodados: {c.kms_rodados} </h2>
              <h2>Receita: {formatarMoeda(c.receita)}</h2>
              <h2>Data: {new Date(c.data).toLocaleDateString("pt-BR")}</h2>
            </div>
          ))
          )}
          
        </div>
        

        {carregando ? (
          <>
          </>
        ) : corridas.length ===0 ? (
          <>
          </>
        ):(
        <h2 className="text-xl w-full mt-auto text-right px-3 py-5 font-semibold ml-auto">
          Lucro total:{formatarMoeda(totalLucro)}
        </h2>
        )}
        
      </div>
    </div>
  );
}
export default Corridas;
