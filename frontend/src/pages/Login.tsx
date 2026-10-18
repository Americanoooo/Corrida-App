import { useState } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle } from "../components/ui/icons";

function Login() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cadastrar, setCadastro] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleLogin(email: string, senha: string) {
    if(!email|| !senha)return setMensagem('Preencha todos os campos')
    try {
      const data = await apiFetch("/usuario/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      localStorage.setItem("token", data.data.token);
      navigate("/motos");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Email ou senha inválidos";

      setMensagem(msg);
    }
  }

  async function handleCadastrar(nome:string, email:string, senha:string){
       if(!email|| !senha|| !nome)return setMensagem('Preencha todos os campos')

    try{
            await apiFetch('/usuario/cadastrar', {
            method: 'POST',
            body: JSON.stringify({nome, email, senha}),
        });
        await handleLogin(email, senha);
    }catch(err){
        const msg = err instanceof Error ? err.message : 'Erro ao cadastrar'
        setMensagem(msg)
    }
  }

  function limparForm(){
    setMensagem('')
    setEmail('')
    setSenha('')
    setNome('')
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-marca/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-lucro/10 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-sm motion-safe:animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="h-14 w-14 rounded-card bg-marca text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-marca/30">
            L
          </span>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-texto">Lucrei</h1>
            <p className="text-sm text-texto-secundario mt-1">Seu lucro real, corrida a corrida</p>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="relative grid grid-cols-2 rounded-controle bg-slate-100 p-1">
            <span
              className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-[calc(var(--radius-controle)-2px)] bg-superficie shadow-sm transition-transform duration-300 ease-out ${
                cadastrar ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => { setCadastro(false); limparForm(); }}
              className={`relative z-10 rounded-controle py-2 text-sm font-semibold transition-colors cursor-pointer min-h-10 ${
                !cadastrar ? "text-marca" : "text-texto-secundario"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setCadastro(true); limparForm(); }}
              className={`relative z-10 rounded-controle py-2 text-sm font-semibold transition-colors cursor-pointer min-h-10 ${
                cadastrar ? "text-marca" : "text-texto-secundario"
              }`}
            >
              Criar conta
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {cadastrar && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nome" className="text-sm font-medium text-texto-secundario">
                  Nome
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconUser className="h-5 w-5" />
                  </span>
                  <input
                    id="nome"
                    className="input-field pl-11"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-texto-secundario">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconMail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  className="input-field pl-11"
                  placeholder="voce@email.com"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className="text-sm font-medium text-texto-secundario">
                Senha
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconLock className="h-5 w-5" />
                </span>
                <input
                  id="senha"
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete={cadastrar ? "new-password" : "current-password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-texto-secundario transition-colors cursor-pointer"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 mt-5">
            {mensagem && (
              <div className="flex items-center gap-2 rounded-controle bg-red-50 border border-erro/20 px-3 py-2.5 text-sm text-erro motion-safe:animate-fade-in">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {mensagem}
              </div>
            )}

            {!cadastrar ? (
              <Button variant="primary" className="w-full" onClick={() => handleLogin(email, senha)}>
                Entrar
              </Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={() => handleCadastrar(nome, email, senha)}>
                Criar conta
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
