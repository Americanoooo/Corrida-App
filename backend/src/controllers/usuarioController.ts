import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buscarPorEmail, criarUsuario } from "../models/usuarioModel";
import { JWT_SECRET } from "../config";
import { AppError } from "../Erros/AppError";
import * as z from "zod";

const Usuario = z.object({
  nome: z.string({ error: "Nome inválido" }).min(3, { error: "Nome deve ter no mínimo 3 letras" }),
  email: z.string({ error: "Email inválido" }).email({ error: "Email inválido" }),
  senha: z
    .string({ error: "Senha inválida" })
    .min(6, { error: "Senha muito curta. Mínimo de 6 caracteres" })
    .regex(/[A-Z]/, { error: "A senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[0-9]/, { error: "A senha deve conter pelo menos um número" }),
});

const Login = z.object({
  email: z.string({ error: "Email inválido" }),
  senha: z.string({ error: "Senha inválida" }),
});


export async function postUsuario(req: Request, res: Response) {
    const bodyValidado = await Usuario.safeParseAsync(req.body);

    if (!bodyValidado.success) {
      throw new AppError(
        400,
        bodyValidado.error.issues[0]?.message || "Dados inválidos",
      );
    }

    const { nome, email, senha } = bodyValidado.data;

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await criarUsuario(nome, email, senhaHash);
    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  
}


export async function postLogin(req: Request, res: Response) {

    const body = req.body;
    const bodyValidado = await Login.safeParseAsync(body)
    if(!bodyValidado.success){
      throw new AppError(400, bodyValidado.error.issues[0]?.message || "Dados inválidos")
    }

    const { email, senha } = bodyValidado.data


    const usuario = await buscarPorEmail(email);

     if(usuario === undefined){
        throw new AppError(401, "Email ou senha inválidos")
    }

    const confere = await bcrypt.compare(senha, usuario.senha_hash);

    if (!confere) {
      throw new AppError(401, "Email ou senha inválidos")
    }

    const token = jwt.sign({ usuario_id: usuario.id }, JWT_SECRET as string, {
      expiresIn: "24h",
    });
    res.json({ token });
}
