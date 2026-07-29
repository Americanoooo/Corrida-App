import { RowDataPacket } from "mysql2";
import pool from "../db";



export async function criarMotoPeca(moto_id:number, peca_id: number, custo:number, intervalo_km:number ){
    const [resultado] = await pool.query(
        'INSERT INTO moto_peca (moto_id, peca_id, custo, intervalo_km) VALUES (?,?,?,?)',
        [moto_id, peca_id, custo, intervalo_km]

    );
    return resultado
}

export async function buscarMotoPorId(moto_id: number){
    const [resultado]= await pool.query<RowDataPacket[]>(
        'SELECT usuario_id FROM moto WHERE id=?',
        [moto_id]
    )
    return resultado[0]
}

export async function listarMotoPecas(moto_id:number, usuario_id:number){
    const [resultado]= await pool.query(
        `SELECT moto_peca.*, peca.nome
        FROM moto_peca
        JOIN peca ON moto_peca.peca_id = peca.id
        JOIN moto ON moto_peca.moto_id = moto.id
        WHERE moto_peca.moto_id = ? AND moto.usuario_id = ?`,
        [moto_id, usuario_id]
    )
    return resultado
}