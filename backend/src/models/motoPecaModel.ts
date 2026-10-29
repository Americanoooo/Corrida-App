import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";
import pool from "../db";
import { AppError } from "../Erros/AppError";


export async function criarMotoPeca(
  moto_id: number,
  peca_id: number,
  custo: number,
  intervalo_km: number,
  usuario_id:number
) {
  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO moto_peca (moto_id, peca_id, custo, intervalo_km)
      SELECT m.id, p.id, ?, ?
      FROM moto m
      JOIN peca p ON p.usuario_id = m.usuario_id 
      WHERE m.id = ? 
        AND p.id = ? 
        AND m.usuario_id = ? 
      ON DUPLICATE KEY UPDATE
      custo = VALUES(custo),
      intervalo_km = VALUES(intervalo_km),
      ativo = TRUE;`,
    [ custo, intervalo_km, moto_id, peca_id,usuario_id],
  );

  return resultado;
}

export async function criarPecaVincularMoto(
  moto_id:number, nome:string, usuario_id:number,   custo: number,
  intervalo_km: number){
      const conn = await pool.getConnection();
      try{
        await conn.beginTransaction();

        let peca_id: number;
        try{
          const [peca] = await conn.query<ResultSetHeader>(
            "INSERT INTO peca (nome, usuario_id) VALUES (?,?)",
            [nome, usuario_id]
          )
          peca_id = peca.insertId
        }catch(err: unknown){
          if(!(err instanceof Error) || (err as any).code !== "ER_DUP_ENTRY"){
            throw err
          }
          const [existente] = await conn.query<RowDataPacket[]>(
            "SELECT id FROM peca WHERE usuario_id = ? AND nome = ?",
            [usuario_id, nome]
          )
          if(!existente[0]){
            throw err
          }
          peca_id = existente[0].id
        }

      const [motoPeca] = await conn.query<ResultSetHeader>(
      `INSERT INTO moto_peca (moto_id, peca_id, custo, intervalo_km)
        SELECT m.id, p.id, ?, ?
        FROM moto m
        JOIN peca p ON p.usuario_id = m.usuario_id
        WHERE m.id = ?
          AND p.id = ?
          AND m.usuario_id = ?
        ON DUPLICATE KEY UPDATE
        custo = VALUES(custo),
        intervalo_km = VALUES(intervalo_km),
        ativo = TRUE;`,
      [ custo, intervalo_km, moto_id, peca_id,usuario_id],
    );

    if(motoPeca.affectedRows === 0){
      throw new AppError(404, "Não foi possível vincular a peça a essa moto")
    }

    await conn.commit();
    return motoPeca
      }catch(err){
        console.error(err)
        await conn.rollback()
        throw err
      }finally{
        conn.release()
      }

}

export async function buscarMotoPorId(moto_id: number) {
  const [resultado] = await pool.query<RowDataPacket[]>(
    "SELECT usuario_id FROM moto WHERE id=?",
    [moto_id],
  );
  return resultado[0];
}

export async function listarMotoPecas(moto_id: number, usuario_id: number) {
  const [resultado] = await pool.query(
    `SELECT moto_peca.*, peca.nome
        FROM moto_peca
        JOIN peca ON moto_peca.peca_id = peca.id
        JOIN moto ON moto_peca.moto_id = moto.id
        WHERE moto_peca.moto_id = ? AND moto.usuario_id = ? AND moto_peca.ativo = TRUE AND peca.ativo = TRUE AND peca.usuario_id=?`,
    [moto_id, usuario_id, usuario_id],
  );
  return resultado;
}

export async function editarMotoPecas(
  usuario_id: number,
  moto_id: number,
  peca_id: number,
  custo: number,
  intervalo_km: number,
) {
  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE moto_peca
        JOIN moto ON moto_peca.moto_id = moto.id
        SET moto_peca.custo = ?, moto_peca.intervalo_km = ?
        WHERE moto_peca.id = ? AND moto_peca.moto_id =? AND moto.usuario_id =? AND moto_peca.ativo = TRUE`,
    [custo, intervalo_km, peca_id, moto_id, usuario_id],
  );
   
  return resultado;
}


export async function desativarMotoPecas(
  usuario_id: number,
  moto_id: number,
  peca_id: number,
) {
  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE moto_peca
        JOIN moto ON moto_peca.moto_id = moto.id
        SET moto_peca.ativo = FALSE
        WHERE moto.id = ? AND moto_peca.id = ? AND moto.usuario_id = ? AND moto_peca.ativo = TRUE`,
    [moto_id, peca_id, usuario_id],
  );
  return resultado;
}
