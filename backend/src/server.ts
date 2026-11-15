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


dotenv.config();

    if(!process.env.FRONTEND_URL){
        console.error("FRONTEND_URL não foi definida")
         throw new Error("FRONTEND_URL não foi definida");
    }

const app=express();
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json());


app.use('/health', getHealth)

app.use('/motos', motoRoutes)
app.use('/pecas', pecaRoutes)
app.use('/corridas', corridaRoutes)
app.use('/usuario', usuarioRoutes)

app.use((_req, res) => {
    res.status(404).json({ message: "Rota não encontrada" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err)
    const message = err instanceof AppError ? err.message : "Erro, tente novamente";
    const status = err instanceof AppError ? err.status : err instanceof SyntaxError ? 400 : 500
    return res.status(status).json({ message });
};

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, ()=> {
    console.log(`Servidor rodando na porta ${PORT}`)
})
