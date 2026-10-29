import pool from "../db";
import { duplicateError } from "../Erros/DuplicateError";

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
        'SELECT * FROM peca WHERE usuario_id= ?',
        [usuario_id]
    );
    return resultado
}