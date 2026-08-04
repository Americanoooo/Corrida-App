import { useState } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cadastrar, setCadastro] = useState(false);

  async function handleLogin(email: string, senha: string) {
    if(!email|| !senha)return setMensagem('Preencha todos os campos')
    try {
      const data = await apiFetch("/usuario/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      localStorage.setItem("token", data.token);
      navigate("/motos");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao fazer login";
      setMensagem('Email ou senha inválidos');
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md">CA</span>
          <h1 className="text-2xl font-bold text-slate-900">CorridaApp</h1>
          <p className="text-sm text-slate-500 text-center">Controle suas corridas com precisão</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-slate-900 text-center mb-6">
            {cadastrar ? "Criar conta" : "Entrar na sua conta"}
          </h2>

          <div className="flex flex-col gap-4">
            {cadastrar && (
              <input
                className="input-field"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            )}
            <input
              className="input-field"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col gap-3 mt-5">
            <p className={mensagem ? "text-sm text-red-600 text-center font-medium" : "invisible text-sm"}>{mensagem}</p>

            {!cadastrar ? (
              <button
                className="btn-primary w-full"
                onClick={()=> handleLogin(email, senha)}
              >
                Entrar
              </button>
            ) : (
              <button
                className="btn-primary w-full"
                onClick={()=> handleCadastrar(nome, email, senha)}
              >
                Cadastrar
              </button>
            )}

            {!cadastrar ? (
              <button
                className="btn-secondary w-full"
                onClick={(()=> {setCadastro(true)  ;limparForm()})}
              >
                Não tem uma conta?
              </button>
            ) : (
              <button
                className="btn-secondary w-full"
                onClick={(()=>{ setCadastro(false); limparForm()})}
              >
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
