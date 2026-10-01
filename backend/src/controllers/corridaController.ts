import { Request, Response } from "express";
import { buscarCorridaPorId, buscarTodasCorridas, criarCorrida, relatorioPorPeriodo } from "../models/corridaModel";
import { AppError } from "../Erros/AppError";

import * as z from "zod"; 

const Corrida = z.object({
    kms_rodados: z.number({ error: "Quilometragem inválida" }).positive("Quilometragem deve ser maior que zero"),
    receita: z.number({ error: "Receita inválida" }).positive("Receita deve ser maior que zero"),
    gasolina_congelada: z.number({ error: "Valor de gasolina congelada inválido" }).positive("Valor de gasolina congelada deve ser maior que zero"),
    data: z.coerce.date({ error: "Data inválida" })
})

const Relatorio = z.object({
    inicio: z.string("inicio e fim são obrigatórios (formato AAA-MM-DD)"),
    fim: z.string("inicio e fim são obrigatórios (formato AAA-MM-DD")
})

export async function postCorrida(req: Request, res:Response){

       
    const usuario_id = req.usuario_id

         if(typeof usuario_id  !== "number"){
        throw new AppError(401, "Usuário inválido")
            }

        const {motoId} = req.params;
        const moto_id= Number(motoId)

        const body = req.body
        const corrida = await Corrida.safeParseAsync(body)
        if(!corrida.success){
            throw new AppError(400, corrida.error.issues[0]?.message ?? "Dados inválidos")
        }
        
        const {kms_rodados, receita, gasolina_congelada, data}= corrida.data

        const resultado = await criarCorrida(usuario_id, moto_id, kms_rodados, receita, gasolina_congelada, data)
        res.status(201).json({message: "Corrida cadastrada com sucesso", resultado})
  

}

export async function getCorridaId(req: Request, res:Response){
    
        const {corridaId} = req.params
        const corrida_id = Number(corridaId)

        const usuario_id = req.usuario_id
         if(typeof usuario_id  !== "number"){
        throw new AppError(401, "Usuário inválido")
            }

        const resultado = await buscarCorridaPorId(corrida_id, usuario_id)
     

        res.status(200).json({resultado})
    }   


export async function getRelatorio(req:Request, res:Response){

   
        const query= req.query;
        const queryValidado = await Relatorio.safeParseAsync(query)
        if(!queryValidado.success){
            throw new AppError(400, queryValidado.error.issues[0]?.message ?? "inicio e fim são obrigatórios (formato AAA-MM-DD")
        }
        const { inicio, fim} = queryValidado.data

       
        const usuario_id = req.usuario_id
        if(typeof usuario_id  !== "number"){
            throw new AppError(401, "Usuário inválido")
        }

        const resultado = await relatorioPorPeriodo(usuario_id, inicio, fim)
        res.status(200).json({message: resultado})
  
}

export async function getCorridas(req: Request, res:Response){
    
        const usuario_id = req.usuario_id
       const query= req.query;
        const queryValidado = await Relatorio.safeParseAsync(query)
        if(!queryValidado.success){
            throw new AppError(400, queryValidado.error.issues[0]?.message ?? "inicio e fim são obrigatórios (formato AAA-MM-DD")
        }
        const { inicio, fim} = queryValidado.data
    
        if(typeof usuario_id  !== "number"){
            throw new AppError(401, "Usuário inválido")
        }

        const resultado = await buscarTodasCorridas(usuario_id, inicio, fim)
        res.status(200).json(resultado)
  
}

