import { Request, Response } from "express";
import { criarPeca, listarPecas } from "../models/pecaModel";


export async function postPeca(req: Request, res:Response){
    try{
        const {nome} = req.body

        const resultado = criarPeca(nome);
        res.status(201).json({message: 'Peça cadastrada com sucesso', resultado});
    }catch(err:unknown){
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        res.status(500).json({error: message})
    }
}

export async function getPeca(req:Request, res:Response){
    try{
        const resultado = await listarPecas()
        res.status(200).json(resultado)
    }catch(err:unknown){
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        res.status(500).json({error: message})
    }
}