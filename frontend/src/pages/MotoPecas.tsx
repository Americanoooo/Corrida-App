import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { formatarMoeda } from "../utils/FormatarMoeda";
import { capitalizar } from "../utils/Capitalizar";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../Erros/ApiError";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import Faixa from "../components/ui/Faixa";
import Fab from "../components/ui/Fab";
import { IconWrench, IconArrowLeft, IconPlus } from "../components/ui/icons";


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

  const [pecaEditando, setPecaEditando]= useState<MotoPeca | null>(null)
  const [custoPeca, setCustoPeca]= useState('')
  const [intervaloKmPeca, setIntervaloKmPeca]=useState('')
  const [feedback, setFeedback] = useState<{texto:string; tipo:"erro" | "ok"} | null>(null);

   const feedbackClasse = !feedback ? "invisible"
  :feedback.tipo ==="erro"
    ?"text-sm text-erro text-center mt-3"
    : "text-sm text-sucesso text-center mt-3";

  const mostrarToast = useToast()

  // Estado só de UI — abrir/fechar o sheet de vincular peça.
  const [novaPecaAberta, setNovaPecaAberta] = useState(false);

  async function buscarPecas() {
    try {
      const data = await apiFetch(`/motos/${motoId}/pecas`);
      setPecas(data.data);
    } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }

  }

  async function handleVincular() {
    if(!pecaId || !custo ||!intervaloKm) return setErro('Preencha todos os campos')
    try {
      await apiFetch(`/motos/${motoId}/pecas`, {
        method: "POST",
        body: JSON.stringify({
          peca_id: Number(pecaId),
          custo: Number(custo),
          intervalo_km: Number(intervaloKm),
        }),
      });
      buscarPecas();
      setCusto('')
      setIntervaloKm('')
      setErro('')
    } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }
}

  async function handleEditar(){
      if(!custoPeca || !intervaloKmPeca) return setFeedback({texto:'Preencha todos os campos', tipo:'erro'});

      try{
          await apiFetch(`/motos/${motoId}/pecas/${pecaEditando?.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              custo: Number(custoPeca),
              intervalo_km: Number(intervaloKmPeca)
            }),
          })
          mostrarToast('Peça atualizada com sucesso!', "ok")
          buscarPecas()
          setFeedback(null)
      }catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }
  }

  useEffect(() => {
    buscarPecas();
    buscarCatalogo();

    async function buscarCatalogo() {
      try {
        const data = await apiFetch("/pecas");
        setCatalogo(data.data);
      } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
  }finally {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(()=> {
    if(pecaEditando){
      setCustoPeca(String(pecaEditando.custo))
      setIntervaloKmPeca(String(pecaEditando.intervalo_km))

    }

  }, [pecaEditando])

  return (
    <>
      <Faixa largura="max-w-4xl">
        <Link
          to="/motos"
          className="inline-flex items-center gap-1.5 min-h-10 px-3 -ml-3 w-fit rounded-controle text-sm font-medium text-faixa-texto-secundario hover:text-faixa-texto hover:bg-white/10 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-faixa"
        >
          <IconArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <PageHeader titulo="Peças da moto" descricao="Gerencie as peças vinculadas a esta moto" tom="claro" />
      </Faixa>

      <div className="max-w-4xl mx-auto flex flex-col gap-6 mt-5">
      {carregando ? (
        <div className="flex flex-col gap-3 motion-safe:animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 rounded-controle bg-slate-100" />
          ))}
        </div>
      ) : pecas.length === 0 ? (
        <EmptyState
          icon={<IconWrench className="h-6 w-6" />}
          titulo="Nenhuma peça vinculada"
          descricao="Toque no + e vincule uma peça pra calcular o custo por km dela."
        />
      ) : (
        <div className="card flex flex-col max-h-120 overflow-y-auto">
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 items-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-texto-secundario border-b border-borda">
            <span>Peça</span>
            <span>Custo / Intervalo</span>
            <span>Custo por Km</span>
            <span></span>
          </div>
          {pecas.map((peca) => (
            <div key={peca.id} className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 px-4 py-3 border-b border-borda last:border-0 hover:bg-slate-50 transition-colors duration-150 text-sm">
              <h2 className="capitalize font-semibold text-texto" >{peca.nome}</h2>
              <h3 className="capitalize text-texto-secundario tabular-nums">
                {formatarMoeda(peca.custo)} - {peca.intervalo_km}km
              </h3>
              <p className="capitalize text-texto-secundario tabular-nums">
                Custo por Km{" "}
                {formatarMoeda(
                  Number(peca.custo) / Number(peca.intervalo_km),
                )}
              </p>
                <button
                    className="flex items-center justify-self-start sm:justify-self-end min-h-12 px-3 rounded-controle text-sm font-medium text-texto-secundario bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40"
                    onClick={()=> setPecaEditando(peca)}
                  >
                    Editar
                  </button>
            </div>
          ))}
        </div>
      )}

      <Fab aria-label="Vincular peça" onClick={() => setNovaPecaAberta(true)}>
        <IconPlus className="h-6 w-6" />
      </Fab>

      <Modal
        aberto={novaPecaAberta}
        titulo="Vincular peça"
        onFechar={() => { setNovaPecaAberta(false); setErro(''); }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="peca-catalogo" className="text-sm font-medium text-texto-secundario">Peça</label>
            <select
              id="peca-catalogo"
              className="select-field"
              value={pecaId}
              onChange={(e) => setPecaId(e.target.value)}
            >
              <option value={""}>Escolha uma peça</option>
              {catalogo.map((peca) => (
                <option key={peca.id} value={peca.id}>
                  {capitalizar(peca.nome)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="custo-peca" className="text-sm font-medium text-texto-secundario">Custo</label>
              <input
                id="custo-peca"
                className="input-field"
                placeholder="Ex: 45,00"
                type="number"
                inputMode="decimal"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="intervalo-peca" className="text-sm font-medium text-texto-secundario">Quantos km</label>
              <input
                id="intervalo-peca"
                className="input-field"
                placeholder="Ex: 10000"
                type="number"
                inputMode="numeric"
                value={intervaloKm}
                onChange={(e) => setIntervaloKm(e.target.value)}
              />
            </div>
          </div>

          {erro && <p className="text-sm text-erro text-center">{erro}</p>}

          <Button variant="primary" onClick={handleVincular}>
            Cadastrar
          </Button>
        </div>
      </Modal>

      <Modal
        aberto={!!pecaEditando}
        titulo={pecaEditando ? `Editar peça: ${pecaEditando.nome}` : "Editar peça"}
        onFechar={() => { setPecaEditando(null); setFeedback(null); }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="custo-peca-editando" className="text-sm font-medium text-texto-secundario">Custo</label>
            <input
              id="custo-peca-editando"
              type="number"
              inputMode="decimal"
              className="input-field"
              value={custoPeca}
              onChange={(e) => setCustoPeca(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="intervalo-peca-editando" className="text-sm font-medium text-texto-secundario">Intervalo por km</label>
            <input
              id="intervalo-peca-editando"
              type="number"
              inputMode="numeric"
              className="input-field"
              value={intervaloKmPeca}
              onChange={(e) => setIntervaloKmPeca(e.target.value)}
            />
          </div>
          <p className={feedbackClasse}>{feedback?.texto}</p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={handleEditar}>Salvar</Button>
            <Button variant="secondary" onClick={() => { setPecaEditando(null); setFeedback(null); }}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}
export default MotoPecas;
