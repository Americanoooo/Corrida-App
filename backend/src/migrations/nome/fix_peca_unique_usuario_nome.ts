import { Pool, RowDataPacket } from "mysql2/promise"
import {MigrationParams} from "umzug"

export async function up({ context: pool }: MigrationParams<Pool>) {
  const [indices] = await pool.query<RowDataPacket[]>(
    "SELECT DISTINCT INDEX_NAME FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'peca' AND INDEX_NAME IN ('nome', 'nome_2')"
  );
  for (const { INDEX_NAME } of indices) {
    await pool.query(`ALTER TABLE peca DROP INDEX \`${INDEX_NAME}\``);
  }
  await pool.query(
    "ALTER TABLE peca ADD UNIQUE KEY uk_peca_usuario_nome (usuario_id, nome)"
  );
}
