import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db";
import { AppError } from "../Erros/AppError";
import { calcularCustoCombustivel, calcularCustoKm } from "../calculos";

export async function criarCorrida(
  usuario_id: number,
  moto_id: number,
  kms_rodados: number,
  receita: number,
  gasolina_congelada: number,
  data: number,
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [motos] = await conn.query<RowDataPacket[]>(
      "SELECT usuario_id FROM moto WHERE id =?",
      [moto_id],
    );
    const moto = motos[0];
    if (moto === undefined) {
      throw new Error("Moto não encontrada");
    }
    if (moto.usuario_id !== usuario_id) {
      throw new Error("Essa moto não é sua");
    }

    const [pecas] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM moto_peca WHERE moto_id = ? ",
      [moto_id],
    );

    const [corrida] = await conn.query<ResultSetHeader>(
      "INSERT INTO corrida (usuario_id, moto_id, kms_rodados, receita, gasolina_congelada, data) VALUES(?,?,?,?,?,?)",
      [usuario_id, moto_id, kms_rodados, receita, gasolina_congelada, data],
    );

    if (pecas.length === 0) {
      throw new AppError(400, "Moto sem peças cadastradas");
    }

    for (const peca of pecas) {
      const custoKm = calcularCustoKm(peca.custo, peca.intervalo_km);
      await conn.query(
        "INSERT INTO corrida_peca (corrida_id, moto_peca_id, custo_km_congelado) VALUES (?,?,?)",
        [corrida.insertId, peca.id, custoKm],
      );
    }

    await conn.commit();
    return corrida.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function buscarCorridaPorId(
  corrida_id: number,
  usuario_id: number,
) {
  const [linhas] = await pool.query<RowDataPacket[]>(
    `SELECT corrida.id, corrida.kms_rodados, corrida.receita, corrida.gasolina_congelada, moto.km_litro, peca.nome, corrida_peca.custo_km_congelado 
         FROM corrida
        JOIN corrida_peca ON corrida.id = corrida_peca.corrida_id
        JOIN moto ON corrida.moto_id = moto.id
        JOIN moto_peca ON corrida_peca.moto_peca_id = moto_peca.id
        JOIN peca ON moto_peca.peca_id = peca.id 
        WHERE corrida.id =? AND corrida.usuario_id =?`,
    [corrida_id, usuario_id],
  );
  if (linhas[0] === undefined) return;
  const corrida = linhas[0];
  const km = Number(corrida.kms_rodados);
  const receita = Number(corrida.receita);
  const gasolina = Number(corrida.gasolina_congelada);
  const kmLitro = Number(corrida.km_litro);

  const custoCombustivel = calcularCustoCombustivel(km  ,kmLitro , gasolina);

  const somaCustoKm = linhas.reduce(
    (acc, linha) => acc + Number(linha.custo_km_congelado),
    0,
  );
  const custoDesgaste = somaCustoKm * km;

  const lucroReal = receita - custoCombustivel - custoDesgaste;
  return {
    id: corrida.id,
    kms_rodados: km,
    receita: receita,
    custo_combustivel: custoCombustivel,
    custo_desgaste: custoDesgaste,
    lucro_real: lucroReal,
    pecas: linhas.map((linha) => ({
      nome: linha.nome,
      custo_km: Number(linha.custo_km_congelado),
      custo_na_corrida: Number(linha.custo_km_congelado) * km,
    })),
  };
}

export async function relatorioPorPeriodo(
  usuario_id: number,
  inicio: string,
  fim: string,
) {
  const [linhas] = await pool.query<RowDataPacket[]>(
    `SELECT
        SUM(corrida.receita) AS receita_total,
        SUM(desgaste.total * corrida.kms_rodados) AS desgaste_total,
        SUM((corrida.kms_rodados / moto.km_litro) * corrida.gasolina_congelada) AS combustivel_total
        FROM corrida
        JOIN ( SELECT corrida_id, SUM(custo_km_congelado) AS total
            FROM corrida_peca GROUP BY corrida_id) AS desgaste
            ON corrida.id = desgaste.corrida_id
        JOIN moto ON corrida.moto_id = moto.id
        WHERE corrida.usuario_id =? AND corrida.data BETWEEN ? AND ?`,
    [usuario_id, inicio, fim],
  );
  if (linhas[0] === undefined) return;
  const r = linhas[0];
  const receitaTotal = Number(r.receita_total);
  const desgasteTotal = Number(r.desgaste_total);
  const combustivelTotal = Number(r.combustivel_total);
  const lucroTotal = receitaTotal - desgasteTotal - combustivelTotal;

  return { receitaTotal, desgasteTotal, combustivelTotal, lucroTotal };
}

export async function buscarTodasCorridas(usuario_id: number, inicio?: string,fim?:string) {
  let sql =     `SELECT
  corrida.id, corrida.data, corrida.receita, corrida.kms_rodados, moto.modelo,
  corrida.receita
    - ((corrida.kms_rodados / moto.km_litro) * corrida.gasolina_congelada)
    - (desgaste.total * corrida.kms_rodados) AS lucro_real
FROM corrida
JOIN (
  SELECT corrida_id, SUM(custo_km_congelado) AS total
  FROM corrida_peca GROUP BY corrida_id
) AS desgaste ON corrida.id = desgaste.corrida_id
JOIN moto ON corrida.moto_id = moto.id
WHERE corrida.usuario_id = ?`

const params:any[] = [usuario_id]

if(inicio && fim){
  sql += ` AND corrida.data BETWEEN ? AND ?`;
  params.push(inicio,fim);
}

sql += ` ORDER BY corrida.data DESC`;
  
  const [linhas] = await pool.query<RowDataPacket[]>(sql, params);
  return linhas;
}

