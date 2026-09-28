import { Request, Response } from "express";
import { buscarMotoPorId, criarMotoPeca, editarMotoPecas, listarMotoPecas } from "../models/motoPecaModel";

import * as z from "zod"; 
import { AppError } from "../Erros/AppError";

const Peca = z.object({
    peca_id: z.number({ error: "Peça inválida" }),
    custo: z.number({ error: "Custo inválido" }).min(0.1, "Custo deve ser maior que zero"),
    intervalo_km: z.number({ error: "Intervalo inválido" }).min(1, "Intervalo deve ser maior que zero")
})

export async function postMotoPeca(req:Request, res:Response){
        const usuario_id = req.usuario_id
        if (typeof usuario_id !== "number") {
            throw new AppError(400, "Usuário inválido")
        }

        const {motoId} = req.params
        const moto_id = Number(motoId)
        
        const moto = await buscarMotoPorId(moto_id);
        if(moto === undefined){
            throw new AppError(404, "Moto não encontrada")
        } 

        if(moto.usuario_id !== usuario_id){
            throw new AppError(404, "Moto não encontrada")
        }



        const body =  req.body
        const bodyVerificado = await Peca.safeParseAsync(body)
        if(!bodyVerificado.success){
            throw new AppError(400, bodyVerificado.error.issues[0]?.message ?? "Dados inválidos")
        }

        const { peca_id, custo, intervalo_km } = bodyVerificado.data
        const resultado =await criarMotoPeca(moto_id, peca_id, custo, intervalo_km)
        res.status(201).json({message: 'Peça da moto cadastrada com sucesso', resultado})
    
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

export async function patchMotoPecas(req:Request, res:Response){

    try{
        const usuario_id = req.usuario_id
        if(typeof usuario_id  !== "number"){
            return res.status(401).json({error: 'Usuário inválido'})
    }
    const {motoId, pecaId} = req.params
    const moto_id = Number(motoId)
    const peca_id = Number(pecaId)
    const { custo, intervalo_km} = req.body

    if(custo<=0 || intervalo_km<= 0 ){
        return res.status(400).json({error: "Dados inválidos"})
    }
    const resultado = await editarMotoPecas(usuario_id, moto_id, peca_id, custo, intervalo_km)
    if(resultado.affectedRows ===0){
            return res.status(404).json({error: 'Não foi possível editar a peça'});
        }
        res.status(200).json({message: 'Peça atualizada!'})
    }catch(err:unknown){
       const message = err instanceof Error ? err.message : 'Erro desconhecido'
        res.status(500).json({error: message})
    }
}