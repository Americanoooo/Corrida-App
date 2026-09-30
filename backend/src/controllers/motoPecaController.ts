import { Request, Response } from "express";
import { buscarMotoPorId, criarMotoPeca, editarMotoPecas, listarMotoPecas } from "../models/motoPecaModel";

import * as z from "zod"; 
import { AppError } from "../Erros/AppError";

const Peca = z.object({
    peca_id: z.number({ error: "Peça inválida" }),
    custo: z.number({ error: "Custo inválido" }).positive( "Custo deve ser maior que zero"),
    intervalo_km: z.number({ error: "Intervalo inválido" }).positive( "Intervalo deve ser maior que zero")
})

const PecaPatch = z.object({
    custo: z.number({ error: "Custo inválido" }).positive( "Custo deve ser maior que zero"),
    intervalo_km: z.number({ error: "Intervalo inválido" }).positive( "Intervalo deve ser maior que zero")
})

export async function postMotoPeca(req:Request, res:Response){
        const usuario_id = req.usuario_id
        if (typeof usuario_id !== "number") {
            throw new AppError(401, "Usuário inválido")
        }

        const {motoId} = req.params
        const moto_id = Number(motoId)
        
        const moto = await buscarMotoPorId(moto_id);
        if(moto === undefined || moto.usuario_id !== usuario_id){
            throw new AppError(404, "Moto não encontrada")
        } 

        
        const body =  req.body
        const bodyVerificado = await Peca.safeParseAsync(body)
        if(!bodyVerificado.success){
            throw new AppError(400, bodyVerificado.error.issues[0]?.message ?? "Dados inválidos")
        }

        const { peca_id, custo, intervalo_km } = bodyVerificado.data
        const resultado =await criarMotoPeca(moto_id, peca_id, custo, intervalo_km)
       return res.status(201).json({message: 'Peça da moto cadastrada com sucesso', resultado})
    
}

export async function getMotoPecas(req:Request, res:Response){
    
     
    const usuario_id = req.usuario_id
    if(typeof usuario_id  !== "number"){
        throw new AppError(401, "Usuário inválido")
    }

    const {motoId} = req.params
    const moto_id = Number(motoId)

     const moto = await buscarMotoPorId(moto_id);
        if(moto === undefined || moto.usuario_id !== usuario_id){
            throw new AppError(404, "Moto não encontrada")
        } 

    const resultado = await listarMotoPecas(moto_id, usuario_id)
 
    return res.status(200).json(resultado)
}
    

export async function patchMotoPecas(req:Request, res:Response){

        const usuario_id = req.usuario_id
      if(typeof usuario_id  !== "number"){
        throw new AppError(401, "Usuário inválido")
    }

    const {motoId, pecaId} = req.params
    const moto_id = Number(motoId)
    const peca_id = Number(pecaId)

     const moto = await buscarMotoPorId(moto_id);
        if(moto === undefined || moto.usuario_id !== usuario_id){
            throw new AppError(404, "Moto não encontrada")
        } 

    const body = req.body
    const bodyVerificado = await PecaPatch.safeParseAsync(body)
     if(!bodyVerificado.success){
            throw new AppError(400, bodyVerificado.error.issues[0]?.message ?? "Dados inválidos")
        }

    const { custo, intervalo_km} = bodyVerificado.data

    const resultado = await editarMotoPecas(usuario_id, moto_id, peca_id, custo, intervalo_km)
    
    if(resultado.affectedRows ===0){
        throw new AppError(404, "Não foi possível editar a peça")
    }
       return res.status(200).json({message: 'Peça atualizada!'})
   
}