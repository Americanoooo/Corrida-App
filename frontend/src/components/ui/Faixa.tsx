import type { ReactNode } from "react";

interface FaixaProps {
  children: ReactNode;
  largura?: string;
}

// Faixa cheia (navbar + cabeçalho + herói). A margem negativa cancela o
// px-4/sm:px-8/pt-8 do <main> em Layout.tsx, pra tocar nas bordas da tela
// sem precisar tirar o padding de quem ainda não usa a faixa.
function Faixa({ children, largura = "max-w-5xl" }: FaixaProps) {
  return (
    <div className="-mx-4 sm:-mx-8 -mt-8 bg-faixa text-faixa-texto">
      <div className={`${largura} mx-auto px-4 sm:px-8 pt-6 pb-8 flex flex-col gap-4`}>
        {children}
      </div>
    </div>
  );
}

export default Faixa;
