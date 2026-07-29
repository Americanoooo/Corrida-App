import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { Link } from "react-router-dom";


interface Moto {
  id: number;
  modelo: string;
  km_litro: number;
}

function Motos() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]=useState('')

  const [modelo, setModelo] = useState("");
  const [km_litro, setKmLitro] = useState("");
  async function buscarMotos() {
    try {
      const data = await apiFetch("/motos");
      setMotos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao buscar motos";
        console.log(message)
        }finally{
    setCarregando(false)
  }}
  useEffect(() => {
    buscarMotos();
  }, []);

  async function handleCadastrar() {
    if(!modelo || !km_litro) return setErro('Preencha todos os campos')
      
    try{
    await apiFetch("/motos", {
      method: "POST",
      body: JSON.stringify({ modelo, km_litro }),
    });
    
    buscarMotos();
    setModelo('')
    setKmLitro('')
    setErro('')
    }catch(err:unknown){
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar'
      console.log(message)
    }
    
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex flex-col justify-center items-center w-1/2 md:w-1/2 mx-auto p-6">
        <div className="bg-white gap-1 px-2 py-7 rounded-xl sm:w-full md:w-1/2 min-h-60">
          <h1 className="text-xl text-center font-semibold mb-3">Adicionar moto nova</h1>

          <div className="flex flex-col w-full gap-2">
            <input
              placeholder="Modelo"
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />

            <input
              placeholder="Km/L"
              type="number"
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"              value={km_litro}
              onChange={(e) => setKmLitro(e.target.value)}
            />
          </div>
          <button 
          onClick={handleCadastrar}
          className="bg-blue-700 text-white rounded-xl p-2 mt-5 mx-auto  w-full cursor-pointer block">Cadastrar</button>
        <p className={erro ? "visible text-red-500 text-center text-lg " : "text-lg text-center invisible"}> Preencha todos os campos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 ">
          
          {carregando ? (
            <h1 className="text-xl text-center mt-10 font-semibold">Carregando...</h1> 
          ) : motos.length === 0 ? (
            <h1 className="text-center text-xl font-semibold">Nenhuma moto encontrada</h1>
          ) : (
            motos.map((moto) => (
              <Link to={`/motos/${moto.id}/pecas`} key={moto.id}> 
              <div className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-gray-100 h-27 w-30"> 
                <h3 className="font-semibold">{moto.modelo}</h3>
                <p className="text-slate-500 text-md">{Number(moto.km_litro)}  Km/L</p>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default Motos;
