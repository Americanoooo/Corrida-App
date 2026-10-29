import pool from "../db";
import { duplicateError } from "../Erros/DuplicateError";
import { ResultSetHeader } from "mysql2";


export async function criarPeca(usuario_id:number, nome:string){
    try{

    
    const [resultado] = await pool.query(
        'INSERT INTO peca (usuario_id, nome) VALUES (?, ?)',
        [usuario_id, nome]
    );
    return resultado;
    }catch(err:unknown){
        duplicateError(err, "Peça já cadastrada")
      
    }
}

export async function listarPecas(usuario_id:number){
    const [resultado] = await pool.query(
        'SELECT * FROM peca WHERE usuario_id= ? AND ativo = TRUE',
        [usuario_id]
    );
    return resultado
}

export async function excluirPeca(peca_id:number, usuario_id:number){
    const [resultado] = await pool.query<ResultSetHeader>(
        'UPDATE peca SET ativo = false WHERE id = ? AND usuario_id = ?',
        [peca_id, usuario_id]
    );
    return resultado
}