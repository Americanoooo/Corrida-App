import { Request, Response } from "express";
import { buscarMotoPorId, criarMotoPeca, listarMotoPecas } from "../models/motoPecaModel";

export async function postMotoPeca(req:Request, res:Response){
    
    try{
        const usuario_id = req.usuario_id
        if (typeof usuario_id !== "number") {
            return res.status(401).json({ error: "Usuário inválido" });
        }

        const {motoId} = req.params
        const moto_id = Number(motoId)
        
        const moto = await buscarMotoPorId(moto_id);
        if(moto === undefined){
            return res.status(404).json({error: 'Moto não encontrada'})
        } 

        if(moto.usuario_id !== usuario_id){
            return res.status(403).json({error:'Essa moto não é sua'})
        }



        const {peca_id, custo, intervalo_km} = req.body

        const resultado =await criarMotoPeca(moto_id, peca_id, custo, intervalo_km)
        res.status(201).json({message: 'Peça da moto cadastrada com sucesso', resultado})
    }catch(err:unknown){
        if(err instanceof Error && (err as any).code ==='ER_DUP_ENTRY'){
            res.status(409).json({error: 'Essa peça já está cadastrada nessa moto'})
        }

        const message = err instanceof Error ? err.message : 'Erro desconhecido'
         res.status(500).json({error: message})
    }
}

export async function getMotoPecas(req:Request, res:Response){
    
    try{
        
    const usuario_id = req.usuario_id
    if(typeof usuario_id  !== "number"){
        return res.status(401).json({error: 'Usuário inválido'})
    }

    const {motoId} = req.params
    const moto_id = Number(motoId)
    const resultado = await listarMotoPecas(moto_id, usuario_id)
    res.status(200).json(resultado)
    }catch(err:unknown){
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        res.status(500).json({error: message})
    }
}