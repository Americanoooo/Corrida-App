import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"


export async function up  ({context: pool} : MigrationParams<Pool>) {
  await pool.query(
    "ALTER TABLE moto MODIFY km_litro DECIMAL(5,2) NOT NULL CHECK (km_litro > 0)"
  )
}

