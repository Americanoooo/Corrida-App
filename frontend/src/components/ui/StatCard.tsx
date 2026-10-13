import type { ReactNode } from "react";

type Tone = "neutro" | "lucro" | "prejuizo";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}

const badgeClasses: Record<Tone, string> = {
  neutro: "bg-marca/10 text-marca",
  lucro: "bg-lucro/10 text-lucro",
  prejuizo: "bg-prejuizo/10 text-prejuizo",
};

const valueClasses: Record<Tone, string> = {
  neutro: "text-texto",
  lucro: "text-lucro",
  prejuizo: "text-prejuizo",
};

function StatCard({ label, value, icon, tone = "neutro" }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <span className={`h-11 w-11 shrink-0 rounded-controle flex items-center justify-center ${badgeClasses[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-texto-secundario">{label}</p>
        <p className={`text-xl font-bold tabular-nums truncate ${valueClasses[tone]}`}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
