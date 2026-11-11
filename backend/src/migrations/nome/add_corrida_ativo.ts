import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"


export async function up  ({context: pool} : MigrationParams<Pool>) {
  await pool.query(
    "ALTER TABLE corrida ADD ativo BOOLEAN DEFAULT TRUE NOT NULL"
  )
}
