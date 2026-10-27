import { useState } from "react";
import { apiFetch } from "../api";
import { ApiError } from "../Erros/ApiError";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { IconEye, IconEyeOff, IconAlertCircle } from "../components/ui/icons";
import TituloEscrito, { duracaoEscrita } from "../components/TituloEscrito";

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
      const msg = err instanceof ApiError && err.status < 500 ? err.message : "Email ou senha inválidos";

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
        const msg = err instanceof ApiError && err.status < 500 ? err.message : 'Erro ao cadastrar'
        setMensagem(msg)
    }
  }

  function limparForm(){
    setMensagem('')
    setEmail('')
    setSenha('')
    setNome('')
  }

  const tituloTexto = cadastrar ? "Vamos começar" : "Bem-vindo de volta";
  const atrasoSubtitulo = duracaoEscrita(tituloTexto) - 60;
  const atrasoApoio = atrasoSubtitulo + 90;

  return (
    <div className="min-h-dvh relative flex flex-col items-center justify-center bg-fundo px-4 py-10">
      <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-8 sm:top-8">
        <span className="h-8 w-8 rounded-controle bg-marca text-white flex items-center justify-center text-sm font-bold">
          L
        </span>
        <span className="font-bold text-texto">Lucrei</span>
      </div>

      <div className="w-full max-w-sm motion-safe:animate-slide-up flex flex-col gap-7">
        <div key={cadastrar ? "cadastro" : "login"} className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold text-texto tracking-tight">
            <TituloEscrito texto={tituloTexto} />
          </h1>
          <p className="text-base font-medium text-texto">
            <span
              className="inline-block motion-safe:animate-surgir"
              style={{ animationDelay: `${atrasoSubtitulo}ms` }}
            >
              Seu lucro real, corrida a corrida.
            </span>
          </p>
          <p className="text-sm text-texto-secundario">
            <span
              className="inline-block motion-safe:animate-surgir"
              style={{ animationDelay: `${atrasoApoio}ms` }}
            >
              {cadastrar ? "Crie sua conta para começar a registrar." : "Entre para continuar seus registros."}
            </span>
          </p>
        </div>

        <div className="card p-5 flex flex-col gap-4">
          {cadastrar && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-sm font-medium text-texto-secundario">
                Nome
              </label>
              <input
                id="nome"
                className="input-field"
                placeholder="Seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-texto-secundario">
              Email
            </label>
            <input
              id="email"
              className="input-field"
              placeholder="voce@email.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-texto-secundario">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                className="input-field pr-12"
                placeholder="Sua senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete={cadastrar ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-texto-secundario transition-colors cursor-pointer"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mensagem && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-erro text-center motion-safe:animate-fade-in">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {mensagem}
            </p>
          )}

          {!cadastrar ? (
            <Button variant="primary" className="w-full !rounded-full" onClick={() => handleLogin(email, senha)}>
              Entrar
            </Button>
          ) : (
            <Button variant="primary" className="w-full !rounded-full" onClick={() => handleCadastrar(nome, email, senha)}>
              Criar conta
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-texto-secundario -mt-3">
          {!cadastrar ? "Não tem conta? " : "Já tem conta? "}
          <button
            type="button"
            onClick={() => { setCadastro(!cadastrar); limparForm(); }}
            className="font-semibold text-marca underline underline-offset-2 cursor-pointer"
          >
            {!cadastrar ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
export default Login;
