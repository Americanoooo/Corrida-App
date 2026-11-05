import { Pool } from "mysql2/promise"
import {MigrationParams} from "umzug"


export async function up  ({context: pool} : MigrationParams<Pool>) {
  await pool.query(
    "ALTER TABLE peca MODIFY usuario_id INT NOT NULL"
  );

  await pool.query(
    "ALTER TABLE peca ADD FOREIGN KEY (usuario_id) REFERENCES usuario(id);"
  );
}

