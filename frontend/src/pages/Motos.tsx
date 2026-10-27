import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../Erros/ApiError";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import Faixa from "../components/ui/Faixa";
import Fab from "../components/ui/Fab";
import { IconWrench, IconBike, IconPlus } from "../components/ui/icons";

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

  // Estado só de UI — abrir/fechar o sheet de nova moto.
  const [novaMotoAberta, setNovaMotoAberta] = useState(false);

  const feedbackClasse = !feedback ? "invisible"
  :feedback.tipo ==="erro"
    ?"text-sm text-erro text-center mt-3"
    : "text-sm text-sucesso text-center mt-3";


  async function buscarMotos() {
    try {
      const data = await apiFetch("/motos");
      setMotos(data.data);
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
        body: JSON.stringify({ modelo, km_litro: Number(km_litro) }),
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
        body: JSON.stringify({ modelo: modeloEditando, km_litro: Number(kmLitroEditando) }),
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
    <>
      <Faixa>
        <PageHeader titulo="Motos" descricao="Cadastre e gerencie suas motos" tom="claro" />
      </Faixa>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 mt-3">
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 motion-safe:animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="card h-20" />
          ))}
        </div>
      ) : motos.length === 0 ? (
        <EmptyState
          icon={<IconBike className="h-6 w-6" />}
          titulo="Nenhuma moto cadastrada"
          descricao="Toque no + e adicione sua moto pra começar a registrar corridas."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {motos.map((moto) => (
            <div
              key={moto.id}
              className="card flex items-center justify-between gap-4 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
            >
                <div className="flex gap-3 items-center min-w-0">
                  <span className="h-11 w-11 shrink-0 rounded-controle bg-marca/10 text-marca flex items-center justify-center font-bold">
                    {moto.modelo.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-texto truncate">
                      {moto.modelo}
                    </h3>
                    <p className="text-texto-secundario text-sm tabular-nums">
                      {Number(moto.km_litro)} km/l
                    </p>
                  </div>
                </div>
                <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2 shrink-0">
                  <Link
                    to={`/motos/${moto.id}/pecas`}
                    className="flex items-center gap-1.5 min-h-12 px-3 rounded-controle text-sm font-medium text-marca bg-marca/10 hover:bg-marca/20 active:bg-marca/25 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40"
                  >
                    <IconWrench className="h-4 w-4" />
                    Peças
                  </Link>
                  <button
                    className="flex items-center gap-1.5 min-h-12 px-3 rounded-controle text-sm font-medium text-marca border border-marca/30 bg-transparent hover:bg-marca/10 active:bg-marca/15 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40"
                    onClick={() => setMotoEditando(moto)}
                  >
                    Editar
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}

      <Fab aria-label="Adicionar moto" onClick={() => setNovaMotoAberta(true)}>
        <IconPlus className="h-6 w-6" />
      </Fab>

      <Modal
        aberto={novaMotoAberta}
        titulo="Adicionar moto"
        onFechar={() => { setNovaMotoAberta(false); setErro(""); }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modelo-nova" className="text-sm font-medium text-texto-secundario">Modelo</label>
            <input
              id="modelo-nova"
              placeholder="Ex: Honda CG 160"
              className="input-field"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="km-litro-nova" className="text-sm font-medium text-texto-secundario">Km/l</label>
            <input
              id="km-litro-nova"
              placeholder="Ex: 35"
              type="number"
              inputMode="decimal"
              className="input-field"
              value={km_litro}
              onChange={(e) => setKmLitro(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-erro text-center">{erro}</p>}

          <Button variant="primary" onClick={handleCadastrar}>
            Cadastrar
          </Button>
        </div>
      </Modal>

      <Modal
        aberto={!!motoEditando}
        titulo="Editar moto"
        onFechar={() => { setMotoEditando(null); setFeedback(null); }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modelo-editando" className="text-sm font-medium text-texto-secundario">Modelo</label>
            <input
              id="modelo-editando"
              className="input-field"
              value={modeloEditando}
              onChange={(e) => setModeloEditando(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="km-litro-editando" className="text-sm font-medium text-texto-secundario">Km/l</label>
            <input
              id="km-litro-editando"
              type="number"
              inputMode="decimal"
              className="input-field"
              value={kmLitroEditando}
              onChange={(e) => setKmLitroEditando(e.target.value)}
            />
          </div>
          <p className={feedbackClasse}>{feedback?.texto}</p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={handleEditar}>Salvar</Button>
            <Button variant="secondary" onClick={() => { setMotoEditando(null); setFeedback(null); }}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}

export default Motos;
