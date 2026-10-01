import { ResultSetHeader } from "mysql2";
import pool from "../db";
import { AppError } from "../Erros/AppError";


export async function criarMoto(usuario_id: number, modelo:string, km_litro:number){

    const [resultado] = await pool.query<ResultSetHeader>(
    "INSERT INTO moto (usuario_id, modelo, km_litro) VALUES (?,?,?)",
    [usuario_id, modelo, km_litro]
);
return resultado
}

export async function listarMoto(usuario_id:number){
    const [resultado] = await pool.query(
        'SELECT * FROM moto WHERE usuario_id = ?',
        [usuario_id]
    );
    return resultado
}

export async function editarMoto(usuario_id:number,modelo:string, km_litro: number, moto_id:number){

    const [resultado]= await pool.query<ResultSetHeader>(
        'UPDATE moto SET modelo = ?, km_litro= ? WHERE id= ? AND usuario_id = ?',
        [modelo, km_litro, moto_id, usuario_id]
    )

    if(resultado.affectedRows === 0){
        throw new AppError(404, "Não foi possível editar a moto")
    }

    return resultado
}