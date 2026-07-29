import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import RotaProtegida from "./components/RotaProtegida"
import Corridas from "./pages/Corridas"
import Motos from "./pages/Motos"
import MotoPecas from "./pages/MotoPecas"
import Layout from "./components/Layout"

function App() {
 


  return (
    <>
     <BrowserRouter>
     <Routes>

      <Route path="/login" element={<Login/>} />
    <Route element={<RotaProtegida> <Layout /> </RotaProtegida>}>
     <Route path="/motos" element={<Motos />}/>
     <Route path="/" element={<Corridas />}/>
     <Route path="/motos/:motoId/pecas" element={<MotoPecas />}/>
</Route>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
