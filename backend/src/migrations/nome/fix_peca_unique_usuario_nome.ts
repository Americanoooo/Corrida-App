import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"

export async function up({ context: pool }: MigrationParams<Pool>) {
  await pool.query("ALTER TABLE peca DROP INDEX nome");
  await pool.query("ALTER TABLE peca DROP INDEX nome_2");
  await pool.query(
    "ALTER TABLE peca ADD UNIQUE KEY uk_peca_usuario_nome (usuario_id, nome)"
  );
}
