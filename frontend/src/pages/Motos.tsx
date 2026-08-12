import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../Erros/ApiError";

interface Moto {
  id: number;
  modelo: string;
  km_litro: number;
}

function Motos() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modelo, setModelo] = useState("");
  const [km_litro, setKmLitro] = useState("");

  const [motoEditando, setMotoEditando] = useState<Moto | null>(null);
  const [modeloEditando, setModeloEditando] = useState("");
  const [kmLitroEditando, setKmLitroEditando] = useState("");
  const mostrarToast = useToast();
  const [feedback, setFeedback] = useState<{texto:string; tipo:"erro" | "ok"} | null>(null);

  const feedbackClasse = !feedback ? "invisible"
  :feedback.tipo ==="erro"
    ?"text-sm text-red-600 text-center mt-3"
    : "text-sm text-green-600 text-center mt-3";


  async function buscarMotos() {
    try {
      const data = await apiFetch("/motos");
      setMotos(data);
    } catch (err: unknown) {
          if(err instanceof ApiError && err.status < 500){
            mostrarToast(err.message, "erro");
          }else{
                mostrarToast("Algo deu errado. Tente novamente.", "erro");
          }
      } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    buscarMotos();
    
  }, []);

  async function handleCadastrar() {
    if (!modelo || !km_litro) return setErro("Preencha todos os campos");

    try {
      await apiFetch("/motos", {
        method: "POST",
        body: JSON.stringify({ modelo, km_litro }),
      });

      buscarMotos();
      setModelo("");
      setKmLitro("");
      setErro("");
    } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }
  }

  async function handleEditar() {
    if (!modeloEditando || !kmLitroEditando)
      return setFeedback({texto:'Preencha todos os campos', tipo:'erro'});
    if(kmLitroEditando === "0") return setFeedback({texto: "Preencha com um número válido", tipo: "erro"})
    try {
      
      await apiFetch(`/motos/${motoEditando?.id}`, {
        method: "PATCH",
        body: JSON.stringify({ modelo: modeloEditando, km_litro: kmLitroEditando }),
      });
      mostrarToast('Moto atualizada!', "ok")
      buscarMotos();

    } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }
  }

  useEffect(() => {
    if (motoEditando) {
      setModeloEditando(motoEditando.modelo);
      setKmLitroEditando(String(motoEditando.km_litro));
      setFeedback(null)
      
    }
  }, [motoEditando]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Motos</h1>
        <p className="text-slate-500 mt-1">Cadastre e gerencie suas motos</p>
      </div>

      <div className="card p-6 max-w-lg w-full">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Adicionar moto nova
        </h2>

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
         <p
                      className={
                        erro
                          ? "text-sm text-red-600 text-center mt-3"
                          : "invisible text-sm mt-3"
                      }
                    >
                      Preencha todos os campos
                    </p>
        <button onClick={handleCadastrar} className="btn-primary w-full mt-4">
          Cadastrar
        </button>
       
       
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Motos cadastradas
        </h2>

        {carregando ? (
          <p className="text-slate-500 text-center py-10">Carregando...</p>
        ) : motos.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            Nenhuma moto encontrada
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 ">
            {motos.map((moto) => (
              <div
                key={moto.id}
                className="card flex items-center justify-between gap-4 p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 group "
              >
                  <div className="flex gap-2 ">
                    <span className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {moto.modelo.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {moto.modelo}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {Number(moto.km_litro)} Km/L
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:opacity-0 sm:group-hover:opacity-100  transition-opacity gap-5">
                    <Link to={`/motos/${moto.id}/pecas`}>
                      <h3 className="bg-slate-200 hover:bg-slate-300 p-2 rounded h-10 ">
                        Peças
                      </h3>
                    </Link>
                    <button
                      className="bg-slate-200 hover:bg-slate-300 p-2 rounded h-10 cursor-pointer "
                      onClick={() => setMotoEditando(moto)}
                    >
                      Editar
                    </button>
                  </div>
              </div>
            ))}
            {motoEditando && (
              <div className="flex items-center justify-center z-50 fixed inset-0 bg-black/50 ">
                <div className="card p-6 max-w-lg w-full ">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Editar Moto{" "}
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div>
                      <label>Modelo</label>
                      <input
                        className="input-field"
                        value={modeloEditando}
                        onChange={(e) => setModeloEditando(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Km/L</label>

                      <input
                        type="number"
                        className="input-field"
                        value={kmLitroEditando}
                        onChange={(e) => setKmLitroEditando(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                     <p className={feedbackClasse}>
         {feedback?.texto}
        </p>
                    <button className="btn-primary w-full mt-4"
                    onClick={handleEditar}>Salvar</button>
                    <button
                      onClick={() => {setMotoEditando(null); setFeedback(null)}}
                      className="btn-primary w-full mt-4 bg-red-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Motos;
