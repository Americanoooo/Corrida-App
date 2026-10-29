import { Request, Response } from "express";
import { criarPeca, excluirPeca, listarPecas } from "../models/pecaModel";
import { AppError } from "../Erros/AppError";
import * as z from "zod";

const Nome = z.object({
  nome: z.string({ error: "Nome inválido." }).min(2),
});

const Peca = z.object({
  peca_id: z.number({error: "Peça inválida."}).positive()}
)

export async function postPeca(req: Request, res: Response) {
    const usuario_id = req.usuario_id;
    if (typeof usuario_id !== "number") {
      throw new AppError(401, "Usuário inválido");
    }
    const body = req.body;
    const bodyValidado = await Nome.safeParseAsync(body);

    if (!bodyValidado.success) {
      throw new AppError(
        400,
        bodyValidado.error.issues[0]?.message || "Nome inválido",
      );
    }

    const nome = bodyValidado.data.nome;

     await criarPeca(usuario_id, nome);
    res.status(201).json({ message: "Peça cadastrada com sucesso"});
}

export async function getPeca(req: Request, res: Response) {
    const usuario_id = req.usuario_id;
  if (typeof usuario_id !== "number") {
    throw new AppError(401, "Usuário inválido");
  }
    const resultado = await listarPecas(usuario_id);
    res.status(200).json({ data: resultado });
}

export async function deletePeca(req: Request, res: Response){

      const usuario_id = req.usuario_id;
  if (typeof usuario_id !== "number") {
    throw new AppError(401, "Usuário inválido");
  }

   const body = req.body;
    const bodyValidado = await Peca.safeParseAsync(body);

    if (!bodyValidado.success) {
      throw new AppError(
        400,
        bodyValidado.error.issues[0]?.message || "Nome inválido",
      );
    }
    const {peca_id} = bodyValidado.data

  const resultado = await excluirPeca(peca_id ,usuario_id )
  if(resultado.affectedRows ===0){
    throw new AppError(400, "Não foi possível excluir a peça.")
  }
  res.status(200).json({message: "Peça excluída com sucesso"})

}