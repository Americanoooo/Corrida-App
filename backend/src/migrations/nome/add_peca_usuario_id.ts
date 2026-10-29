import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"

export async function up({ context: pool }: MigrationParams<Pool>) {
  await pool.query(
    "ALTER TABLE peca ADD COLUMN usuario_id INT NULL;"
  );

  await pool.query(
    "UPDATE peca SET usuario_id = 1 WHERE usuario_id IS NULL;"
  );
}

