import type { ReactNode } from "react";

type Tom = "lucro" | "prejuizo";

interface Selo {
  conteudo: ReactNode;
  tom: Tom;
}

interface HeroMetricProps {
  label: string;
  value: ReactNode;
  selo?: Selo;
}

const seloClasses: Record<Tom, string> = {
  lucro: "bg-lucro-selo-bg text-lucro-selo-texto",
  prejuizo: "bg-prejuizo-selo-bg text-prejuizo-selo-texto",
};

function HeroMetric({ label, value, selo }: HeroMetricProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <p className="text-sm font-medium text-faixa-texto-secundario uppercase tracking-wide">{label}</p>
      <p className="text-4xl font-bold tabular-nums text-faixa-texto">{value}</p>
      {selo && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${seloClasses[selo.tom]}`}
        >
          {selo.conteudo}
        </span>
      )}
    </div>
  );
}

export default HeroMetric;
