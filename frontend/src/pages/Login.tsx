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
      console.log(msg)
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
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="flex flex-col justify-center rounded-xl shadow items-center gap-1 min-h-100 p-2 text-center  bg-white mx-auto w-80 md:w-1/4">
        <h1 className="text-xl font-semibold">CorridaApp</h1>

        <div className="flex flex-col gap-4 py-1 px-5 w-full text-large ">
          {cadastrar && (
            <input
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"              
             placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          )}
          <input
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"           
              placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"            
             placeholder="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col gap-3 text-large  px-5">
          <p  className={mensagem ?"text-red-500 " : "invisible"}>{mensagem}</p>

          {!cadastrar ? (
               <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer"
            onClick={()=> handleLogin(email, senha)}
          >
            Entrar
          </button>
         
           
          ) : (
              <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer"
              onClick={()=> handleCadastrar(nome, email, senha)}
            >
              Cadastrar
            </button>
           
          )}

                {!cadastrar ? (
               <button
            className="bg-slate-400 hover:bg-slate-500 text-white p-2 rounded  cursor-pointer"
            onClick={(()=> {setCadastro(true)  ;limparForm()})}
          >
           Não tem uma conta?
          </button>
         
          ) : (
              <button
              className="bg-slate-400 hover:bg-slate-500 text-white p-2 rounded  cursor-pointer"
              onClick={(()=>{ setCadastro(false); limparForm()})}
            >
              Voltar para o login
            </button>
           
          )}

        </div>
      </div>
    </div>
  );
}
export default Login;
