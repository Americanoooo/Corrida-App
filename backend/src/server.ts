import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import motoRoutes  from "./routes/motoRoutes";
import pecaRoutes from './routes/pecaRoutes';
import corridaRoutes from './routes/corridaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import { getHealth } from "./health";

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());


app.use('/health', getHealth)

app.use('/motos', motoRoutes)
app.use('/pecas', pecaRoutes)
app.use('/corridas', corridaRoutes)
app.use('/usuario', usuarioRoutes)

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, ()=> {
    console.log(`Servidor rodando na porta ${PORT}`)
})
