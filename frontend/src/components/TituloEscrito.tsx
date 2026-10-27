const MS_POR_LETRA = 26;
const GAP_ENTRE_PALAVRAS = 25;
const DURACAO_MINIMA = 90;

interface PalavraPlanejada {
  palavra: string;
  atraso: number;
  duracao: number;
}

/**
 * Cada palavra ganha um atraso (quando começa) e uma duração (quanto tempo
 * a máscara leva pra atravessá-la), em função do tamanho da palavra. É isso
 * que faz o título parecer "digitado" palavra por palavra em vez de tudo
 * de uma vez.
 */
function planejar(texto: string, atrasoInicial: number): PalavraPlanejada[] {
  let cursor = atrasoInicial;
  return texto.split(" ").map((palavra) => {
    const duracao = Math.max(palavra.length * MS_POR_LETRA, DURACAO_MINIMA);
    const atraso = cursor;
    cursor += duracao + GAP_ENTRE_PALAVRAS;
    return { palavra, atraso, duracao };
  });
}

/** Quando a última palavra termina de "escrever" — pra atrasar o que vem depois. */
export function duracaoEscrita(texto: string, atrasoInicial = 0): number {
  const plano = planejar(texto, atrasoInicial);
  const ultima = plano[plano.length - 1];
  return ultima ? ultima.atraso + ultima.duracao : atrasoInicial;
}

interface TituloEscritoProps {
  texto: string;
  className?: string;
  atraso?: number;
}

function TituloEscrito({ texto, className = "", atraso = 0 }: TituloEscritoProps) {
  const plano = planejar(texto, atraso);

  return (
    <span className={className}>
      <span aria-hidden="true">
        {plano.map(({ palavra, atraso: atrasoPalavra, duracao }, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span
              className="inline-block motion-safe:palavra-escrita"
              style={{ animationDelay: `${atrasoPalavra}ms`, animationDuration: `${duracao}ms` }}
            >
              {palavra}
            </span>
          </span>
        ))}
      </span>
      <span className="sr-only">{texto}</span>
    </span>
  );
}

export default TituloEscrito;
