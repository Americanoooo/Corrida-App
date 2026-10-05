import { RowDataPacket } from "mysql2";
import pool from "../db";
import { duplicateError } from "../Erros/DuplicateError";

export async function criarUsuario( nome:string, email:string, senhaHash:string){
    
    try{
    const [resultado] = await pool.query(
        'INSERT INTO usuario (nome, email, senha_hash) VALUES (?,?,?)',
        [nome, email, senhaHash]
    );

    return resultado
    }catch(err:unknown){
        duplicateError(err, "Email já cadastrado")
    }
}

export async function buscarPorEmail(email:string){
    const [resultado]= await pool.query<RowDataPacket[]>(
        'SELECT * FROM usuario WHERE email = ?',
        [email]
    );
   
    return resultado[0]
}