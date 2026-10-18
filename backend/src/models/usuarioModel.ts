import { RowDataPacket } from "mysql2";
import pool from "../db";
import { duplicateError } from "../Erros/DuplicateError";


interface Admin extends RowDataPacket{
    admin: number
}

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

export async function verificarAdmin(usuario_id:number){
    const [resultado] = await pool.query<Admin[]>(
        'SELECT admin FROM usuario WHERE id = ?',
        [usuario_id]
    );
    return resultado[0]?.admin ?? 0
}   