import pool from "../db";

export async function criarPeca(nome:string){
    const [resultado] = await pool.query(
        'INSERT INTO peca (nome) VALUES (?)',
        [nome]
    );
    return resultado;
}

export async function listarPecas(){
    const [resultado] = await pool.query(
        'SELECT * FROM peca'
    );
    return resultado
}