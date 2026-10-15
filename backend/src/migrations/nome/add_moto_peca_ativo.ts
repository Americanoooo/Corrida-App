import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"


export async function up  ({context: pool} : MigrationParams<Pool>) {
  await pool.query(
    "ALTER TABLE moto_peca ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE"
  )
}

