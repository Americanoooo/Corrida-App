import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { formatarMoeda } from "../utils/FormatarMoeda";
import { dataLocalISO, formatarDataISO } from "../utils/DataLocal";
import { ApiError } from "../Erros/ApiError";
import { useToast } from "../context/ToastContext";
import PageHeader from "../components/ui/PageHeader";
import HeroMetric from "../components/ui/HeroMetric";
import Faixa from "../components/ui/Faixa";
import Fab from "../components/ui/Fab";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import GrupoDoDia from "../components/corridas/GrupoDoDia";
import { IconTrendUp, IconTrendDown, IconPlus, IconFilter, IconRoute } from "../components/ui/icons";

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
  data: string;
}
interface PecaDoCusto {
  nome: string;
  custo_km: number;
  custo_na_corrida: number;
}
interface DetalheCorrida {
  custo_combustivel: number;
  custo_desgaste: number;
  pecas: PecaDoCusto[];
}

// Agrupamento por dia é só apresentação — mesmo tipo de soma que já existia
// pra totalLucro, só organizada por chave de data em vez de uma soma só.
function rotuloDoDia(dataFormatada: string) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const ontem = new Date(Date.now() - 86400000).toLocaleDateString("pt-BR");
  if (dataFormatada === hoje) return "Hoje";
  if (dataFormatada === ontem) return "Ontem";
  return dataFormatada;
}

function agruparPorDia(corridas: Corrida[]) {
  const grupos = new Map<string, Corrida[]>();
  for (const c of corridas) {
    const chave = formatarDataISO(c.data);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(c);
  }
  return Array.from(grupos.entries()).map(([dataFormatada, itens]) => ({
    dataFormatada,
    rotulo: rotuloDoDia(dataFormatada),
    itens,
    lucroDia: itens.reduce((ac, c) => ac + Number(c.lucro_real), 0),
  }));
}

function FiltroChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-full border border-faixa-borda bg-white/5 text-sm font-medium text-faixa-texto hover:bg-white/10 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-faixa"
    >
      <IconFilter className="h-4 w-4" />
      Filtrar
    </button>
  );
}

function Corridas() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [moto_id, setMotoId] = useState("");
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [kmsRodados, setKmsRodados] = useState("");
  const [receita, setReceita] = useState("");
  const [gasolina, setGasolina] = useState("");
  const [data, setData] = useState(dataLocalISO());
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motoCorridaFiltro, setMotoCorridaFiltro]=useState('')
  const [carregando, setCarregando]=useState(true)
  const [enviando, setEnviando]=useState(false)
  const mostrarToast = useToast()

  // Estado só de UI — abrir/fechar os sheets. Não afeta busca nem cadastro.
  const [formAberto, setFormAberto] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [corridaSelecionada, setCorridaSelecionada] = useState<Corrida | null>(null);
  const [detalheCorrida, setDetalheCorrida] = useState<DetalheCorrida | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);


    const corridasFiltradas = motoCorridaFiltro
    ? corridas.filter((c)=> c.modelo ===motoCorridaFiltro)
    :corridas

  const totalLucro = corridasFiltradas.reduce((ac, c) => ac + Number(c.lucro_real), 0);
  const totalReceita = corridasFiltradas.reduce((ac, c) => ac + Number(c.receita), 0);
  const totalKm = corridasFiltradas.reduce((ac, c) => ac + Number(c.kms_rodados), 0);
  const gruposDoDia = agruparPorDia(corridasFiltradas);

  useEffect(() => {
    async function buscarMotos() {
      try {
        const todasMotos = await apiFetch(`/motos`);
        setMotos(todasMotos.data);
      } catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
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
      setCorridas(data.data);
    }catch (err: unknown) {
      if(err instanceof ApiError && err.status < 500){
        mostrarToast(err.message, "erro");
      }else{
            mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
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
    setEnviando(true);
    try {
     const corrida = await apiFetch(`/motos/${moto_id}/corridas`, {
        method: "POST",
        body: JSON.stringify({
          kms_rodados: Number(kmsRodados),
          receita: Number(receita.replace(",", ".")),
          gasolina_congelada: Number(gasolina.replace(",", ".")),
          data,
        }),
      });
      setErro("");
      setKmsRodados("");
      setReceita("");
      setGasolina("");
      mostrarToast(corrida.message, "ok")

    } catch (err: unknown) {
      if(err instanceof ApiError && err.status ===400){
        setErro('Nenhuma peça cadastrada')
      }
      const message =
        err instanceof ApiError && err.status < 500 ? err.message : "Erro ao cadastrar corridas";
mostrarToast(message, "erro")
    } finally {
      setEnviando(false);
    }
    buscarCorridas();
  }

  async function handleSelecionarCorrida(corrida: Corrida) {
    setCorridaSelecionada(corrida);
    setDetalheCorrida(null);
    setCarregandoDetalhe(true);
    try {
      const resposta = await apiFetch(`/corridas/buscar/${corrida.id}`);
      setDetalheCorrida(resposta.data);
    } catch {
      // Breakdown é um extra sobre os dados já exibidos pelo resumo da lista — se falhar, o modal segue usável.
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  async function handleExcluirCorrida() {
    if (!corridaSelecionada) return;
    setExcluindo(true);
    try {
      await apiFetch(`/corridas/${corridaSelecionada.id}`, { method: "DELETE" });
      mostrarToast("Corrida excluída com sucesso", "ok");
      setCorridaSelecionada(null);
      buscarCorridas(inicio, fim);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status < 500) {
        mostrarToast(err.message, "erro");
      } else {
        mostrarToast("Algo deu errado. Tente novamente.", "erro");
      }
    } finally {
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  }

  function filtrarMes() {
    const agora = new Date();
    const inicioH = dataLocalISO(new Date(agora.getFullYear(), agora.getMonth(), 1));
    const fimH = dataLocalISO();
    setInicio(inicioH);
    setFim(fimH);
  }

  function filtrarHoje() {
    const hoje = dataLocalISO();
    setInicio(hoje);
    setFim(hoje);
  }

  function filtrarSemana() {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const inicioH = dataLocalISO(seteDiasAtras);
    const hoje = dataLocalISO();
    setInicio(inicioH);
    setFim(hoje);
  }

  return (
    <>
      <Faixa>
        <PageHeader
          titulo="Corridas"
          tom="claro"
          acao={<FiltroChip onClick={() => setFiltroAberto(true)} />}
        />

        <div className="flex flex-col items-center gap-3">
          <HeroMetric
            label="Lucro no período"
            value={formatarMoeda(totalLucro)}
            selo={{
              tom: totalLucro >= 0 ? "lucro" : "prejuizo",
              conteudo: (
                <>
                  {totalLucro >= 0 ? (
                    <IconTrendUp className="h-3.5 w-3.5" />
                  ) : (
                    <IconTrendDown className="h-3.5 w-3.5" />
                  )}
                  {totalLucro >= 0 ? "No positivo" : "No negativo"} ·{" "}
                  {corridasFiltradas.length} corrida{corridasFiltradas.length === 1 ? "" : "s"}
                </>
              ),
            }}
          />
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs pt-4 border-t border-faixa-borda/40">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-faixa-texto-secundario">Receita</span>
              <span className="text-base font-semibold text-faixa-texto tabular-nums">
                {formatarMoeda(totalReceita)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-faixa-texto-secundario">Km rodados</span>
              <span className="text-base font-semibold text-faixa-texto tabular-nums">{totalKm} km</span>
            </div>
          </div>
        </div>
      </Faixa>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 mt-3">
      <div className="flex flex-col gap-4">
        {carregando ? (
          <div className="flex flex-col gap-3 motion-safe:animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-card bg-slate-100" />
            ))}
          </div>
        ) : gruposDoDia.length === 0 ? (
          <EmptyState
            icon={<IconRoute className="h-6 w-6" />}
            titulo="Nenhuma corrida por aqui ainda"
            descricao="Toque no + e cadastre sua primeira corrida pra acompanhar o lucro em tempo real."
          />
        ) : (
          gruposDoDia.map((grupo) => (
            <GrupoDoDia
              key={grupo.dataFormatada}
              rotulo={grupo.rotulo}
              lucroDia={grupo.lucroDia}
              corridas={grupo.itens}
              onSelecionar={handleSelecionarCorrida}
            />
          ))
        )}
      </div>

      <Fab aria-label="Registrar corrida" onClick={() => setFormAberto(true)}>
        <IconPlus className="h-6 w-6" />
      </Fab>

      <Modal aberto={formAberto} titulo="Registrar corrida" onFechar={() => setFormAberto(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="moto-corrida" className="text-sm font-medium text-texto-secundario">Moto</label>
            <select
              id="moto-corrida"
              className="select-field"
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
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kms-rodados" className="text-sm font-medium text-texto-secundario">Km rodados</label>
              <input
                id="kms-rodados"
                className="input-field"
                placeholder="Ex: 120"
                type="number"
                inputMode="decimal"
                value={kmsRodados}
                onChange={(e) => setKmsRodados(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="receita" className="text-sm font-medium text-texto-secundario">Receita</label>
              <input
                id="receita"
                className="input-field"
                placeholder="Ex: 85,00"
                type="number"
                inputMode="decimal"
                value={receita}
                onChange={(e) => setReceita(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gasolina" className="text-sm font-medium text-texto-secundario">Preço da gasolina</label>
              <input
                id="gasolina"
                className="input-field"
                placeholder="Ex: 5,89"
                type="number"
                inputMode="decimal"
                value={gasolina}
                onChange={(e) => setGasolina(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-52">
            <label htmlFor="data-corrida" className="text-sm font-medium text-texto-secundario">Data</label>
            <input
              id="data-corrida"
              className="input-field"
              type="date"
              value={data}
              max={hoje}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-erro text-center">{erro}</p>}

          <Button variant="primary" className="w-full" loading={enviando} onClick={handleRegistrar}>
            Cadastrar
          </Button>
        </div>
      </Modal>

      <Modal aberto={filtroAberto} titulo="Filtrar corridas" onFechar={() => setFiltroAberto(false)}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="moto-filtro" className="text-sm font-medium text-texto-secundario">Moto</label>
            <select
              id="moto-filtro"
              className="select-field"
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

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-texto-secundario">Período rápido</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 rounded-full!"
                onClick={() => { filtrarHoje(); setFiltroAberto(false); }}
              >
                Hoje
              </Button>
              <Button
                variant="secondary"
                className="flex-1 rounded-full!"
                onClick={() => { filtrarSemana(); setFiltroAberto(false); }}
              >
                Semana
              </Button>
              <Button
                variant="secondary"
                className="flex-1 rounded-full!"
                onClick={() => { filtrarMes(); setFiltroAberto(false); }}
              >
                Mês
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="data-inicio" className="text-sm font-medium text-texto-secundario">Início</label>
              <input
                id="data-inicio"
                className="input-field"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="data-fim" className="text-sm font-medium text-texto-secundario">Fim</label>
              <input
                id="data-fim"
                className="input-field"
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          </div>

          <Button variant="secondary" onClick={() => setFiltroAberto(false)}>
            Fechar
          </Button>
        </div>
      </Modal>

      <Modal
        aberto={!!corridaSelecionada}
        titulo="Detalhes da corrida"
        onFechar={() => { setCorridaSelecionada(null); setDetalheCorrida(null); setConfirmandoExclusao(false); }}
      >
        {corridaSelecionada && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-texto-secundario">Moto</span>
                <span className="font-medium text-texto">{corridaSelecionada.modelo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-texto-secundario">Data</span>
                <span className="font-medium text-texto">
                  {formatarDataISO(corridaSelecionada.data)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-texto-secundario">Km rodados</span>
                <span className="font-medium text-texto tabular-nums">{corridaSelecionada.kms_rodados} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-texto-secundario">Receita</span>
                <span className="font-medium text-texto tabular-nums">{formatarMoeda(corridaSelecionada.receita)}</span>
              </div>

              {carregandoDetalhe ? (
                <div className="flex flex-col gap-1.5 motion-safe:animate-pulse">
                  <div className="h-4 rounded bg-slate-100" />
                  <div className="h-4 rounded bg-slate-100" />
                </div>
              ) : detalheCorrida && (
                <>
                  <div className="flex items-center justify-between text-texto-secundario">
                    <span>Combustível</span>
                    <span className="tabular-nums">- {formatarMoeda(detalheCorrida.custo_combustivel)}</span>
                  </div>
                  <div className="flex items-center justify-between text-texto-secundario">
                    <span>Desgaste de peças</span>
                    <span className="tabular-nums">- {formatarMoeda(detalheCorrida.custo_desgaste)}</span>
                  </div>
                  {detalheCorrida.pecas.length > 0 && (
                    <div className="flex flex-col gap-1 pl-3 border-l border-borda text-xs text-texto-secundario">
                      {detalheCorrida.pecas.map((peca, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="truncate">{peca.nome}</span>
                          <span className="tabular-nums shrink-0">- {formatarMoeda(peca.custo_na_corrida)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-texto-secundario">Lucro</span>
                <span className={`font-semibold tabular-nums ${Number(corridaSelecionada.lucro_real) >= 0 ? "text-lucro" : "text-prejuizo"}`}>
                  {formatarMoeda(corridaSelecionada.lucro_real)}
                </span>
              </div>
            </div>

            <div className="border-t border-borda pt-4">
              {confirmandoExclusao ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-texto-secundario text-center">
                    Tem certeza? A corrida sai do seu histórico e dos relatórios.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="danger" loading={excluindo} onClick={handleExcluirCorrida}>
                      Sim, excluir corrida
                    </Button>
                    <Button variant="ghost" disabled={excluindo} onClick={() => setConfirmandoExclusao(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full text-sm text-erro/80 hover:text-erro transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:underline"
                  onClick={() => setConfirmandoExclusao(true)}
                >
                  Excluir corrida
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
      </div>
    </>
  );
}
export default Corridas;
