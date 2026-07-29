import { RowDataPacket } from "mysql2";
import pool from "../db";

export async function CriarUsuario( nome:string, email:string, senhaHash:string){
    
    const [resultado] = await pool.query(
        'INSERT INTO usuario (nome, email, senha_hash) VALUES (?,?,?)',
        [nome, email, senhaHash]
    );
    return resultado
}

export async function buscarPorEmail(email:string){
    const [resultado]= await pool.query<RowDataPacket[]>(
        'SELECT * FROM usuario WHERE email = ?',
        [email]
    );
    return resultado[0]
}