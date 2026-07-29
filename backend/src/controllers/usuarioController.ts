import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buscarPorEmail, CriarUsuario } from "../models/usuarioModel";
import { error } from "node:console";
import { JWT_SECRET } from "../config";

export async function postUsuario(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" });
    }

    if (senha.length < 6) {
      return res
        .status(400)
        .json({ error: "Senha muito curta. Mínimo de 6 caracteres" });
    }
    if (!/[a-zA-Z]/.test(senha)) {
      return res.status(400).json({
        error: "A senha deve conter pelo menos uma letra.",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await CriarUsuario(nome, email, senhaHash);
    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Esse email já está cadastrado" });
    }

    const message = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(500).json({ error: message });
  }
}

export async function postLogin(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;
    const usuario = await buscarPorEmail(email);
    if (usuario === undefined) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const confere = await bcrypt.compare(senha, usuario.senha_hash);

    if (!confere) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ usuario_id: usuario.id }, JWT_SECRET as string, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(500).json({ error: message });
  }
}
