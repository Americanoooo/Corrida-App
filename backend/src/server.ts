import express from "express";
import type { ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import motoRoutes  from "./routes/motoRoutes";
import pecaRoutes from './routes/pecaRoutes';
import corridaRoutes from './routes/corridaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import { getHealth } from "./health";
import { AppError } from "./Erros/AppError";
import { autenticar } from "./autenticar";


dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());


app.use('/health', getHealth)

app.use('/motos', motoRoutes)
app.use('/pecas', pecaRoutes)
app.use('/corridas', corridaRoutes)
app.use('/usuario', usuarioRoutes)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err)
    const message = err instanceof AppError ? err.message : "Erro, tente novamente";
    const status = err instanceof AppError ? err.status : 500
    return res.status(status).json({error: message});
};

app.use('/', errorHandler);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, ()=> {
    console.log(`Servidor rodando na porta ${PORT}`)
})
