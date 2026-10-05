import pool from "../db";
import { duplicateError } from "../Erros/DuplicateError";

export async function criarPeca(nome:string){
    try{

    
    const [resultado] = await pool.query(
        'INSERT INTO peca (nome) VALUES (?)',
        [nome]
    );
    return resultado;
    }catch(err:unknown){
        duplicateError(err, "Peça já cadastrada")
      
    }
}

export async function listarPecas(){
    const [resultado] = await pool.query(
        'SELECT * FROM peca'
    );
    return resultado
}