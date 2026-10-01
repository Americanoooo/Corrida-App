import { Request, Response } from "express";
import { criarMoto, editarMoto, listarMoto } from "../models/motoModel";
import { AppError } from "../Erros/AppError";

import * as z from "zod";

const Moto = z.object({
  modelo: z.string({ error: "Modelo inválido" }),
  km_litro: z
    .number({ error: "Km / L inválido" })
    .positive({ error: "Km / L deve ser positivo" }),
});

export async function postMoto(req: Request, res: Response) {
  const usuario_id = req.usuario_id;
  if (typeof usuario_id !== "number") {
    throw new AppError(401, "Usuário inválido");
  }

  const body = req.body;
  const bodyValidado = await Moto.safeParseAsync(body);

  if (!bodyValidado.success) {
    throw new AppError(
      400,
      bodyValidado.error.issues[0]?.message || "Dados inválidos",
    );
  }

  const { modelo, km_litro } = bodyValidado.data;

  const resultado = await criarMoto(usuario_id, modelo, km_litro);
  res.status(201).json({ message: "Moto criada", id: resultado.insertId } );
}

export async function getMoto(req: Request, res: Response) {
  const usuario_id = req.usuario_id;
  if (typeof usuario_id !== "number") {
    throw new AppError(401, "Usuário inválido");
  }
  const resultado = await listarMoto(usuario_id);

  res.status(200).json({message: "lista "});
}

export async function patchMoto(req: Request, res: Response) {
  const usuario_id = req.usuario_id;
  if (typeof usuario_id !== "number") {
    throw new AppError(401, "Usuário inválido");
  }
  const body = req.body;
  const bodyValidado = await Moto.safeParseAsync(body);

  if (!bodyValidado.success) {
    throw new AppError(
      400,
      bodyValidado.error.issues[0]?.message || "Dados inválidos",
    );
  }

  const { modelo, km_litro } = bodyValidado.data;

  const { motoId } = req.params;
  const moto_id = Number(motoId);
  const resultado = await editarMoto(usuario_id, modelo, km_litro, moto_id);

  res.status(200).json({ message: "Moto atualizada" });
}
