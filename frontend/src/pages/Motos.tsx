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
    }

  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Motos</h1>
        <p className="text-slate-500 mt-1">Cadastre e gerencie suas motos</p>
      </div>

      <div className="card p-6 max-w-lg w-full">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Adicionar moto nova</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Modelo"
            className="input-field"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />

          <input
            placeholder="Km/L"
            type="number"
            className="input-field"
            value={km_litro}
            onChange={(e) => setKmLitro(e.target.value)}
          />
        </div>
        <button
          onClick={handleCadastrar}
          className="btn-primary w-full mt-4"
        >
          Cadastrar
        </button>
        <p className={erro ? "text-sm text-red-600 text-center mt-3" : "invisible text-sm mt-3"}>Preencha todos os campos</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Motos cadastradas</h2>

        {carregando ? (
          <p className="text-slate-500 text-center py-10">Carregando...</p>
        ) : motos.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Nenhuma moto encontrada</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {motos.map((moto) => (
              <Link
                to={`/motos/${moto.id}/pecas`}
                key={moto.id}
                className="card flex items-center gap-4 p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200"
              >
                <span className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {moto.modelo.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{moto.modelo}</h3>
                  <p className="text-slate-500 text-sm">{Number(moto.km_litro)} Km/L</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Motos;
