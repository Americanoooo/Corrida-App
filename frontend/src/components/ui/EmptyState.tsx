import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

function EmptyState({ icon, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-12 px-4">
      <span className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
        {icon}
      </span>
      <p className="font-semibold text-texto">{titulo}</p>
      {descricao && <p className="text-sm text-texto-secundario max-w-xs">{descricao}</p>}
      {acao}
    </div>
  );
}

export default EmptyState;
