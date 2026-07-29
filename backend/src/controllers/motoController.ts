import { Request, Response } from "express";
import { criarMoto, listarMoto } from "../models/motoModel";

export async function postMoto(req: Request, res:Response){
    try{
        const usuario_id = req.usuario_id
        if (typeof usuario_id !== "number") {
            return res.status(401).json({ error: "Usuário inválido" });
        }
        
        const {modelo, km_litro} = req.body
        
        const resultado = await criarMoto(usuario_id, modelo, km_litro);
        res.status(201).json({message: "Moto cadastrada com sucesso", resultado});
    }catch(err: unknown){
        const message = err instanceof Error ? err.message:'Erro desconhecido'
        res.status(500).json({error: message})
    }
}

export async function getMoto(req: Request, res:Response){
    try{
        const usuario_id = req.usuario_id
        if(typeof usuario_id !== 'number'){
            return res.status(401).json({error:'Usuário inválido'})
        }
        const resultado = await listarMoto(usuario_id);

        res.status(200).json(resultado)
    }catch(err: unknown){
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        res.status(500).json({error: message})
    }
}
