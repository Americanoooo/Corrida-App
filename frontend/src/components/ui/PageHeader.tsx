import type { ReactNode } from "react";

type Tom = "escuro" | "claro";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  /** "escuro" = sobre fundo claro (padrão). "claro" = dentro da <Faixa>. */
  tom?: Tom;
}

const tituloClasses: Record<Tom, string> = {
  escuro: "text-texto",
  claro: "text-faixa-texto",
};

const descricaoClasses: Record<Tom, string> = {
  escuro: "text-texto-secundario",
  claro: "text-faixa-texto-secundario",
};

function PageHeader({ titulo, descricao, acao, tom = "escuro" }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <h1 className={`text-2xl font-bold ${tituloClasses[tom]}`}>{titulo}</h1>
        {acao}
      </div>
      {descricao && <p className={descricaoClasses[tom]}>{descricao}</p>}
    </div>
  );
}

export default PageHeader;
