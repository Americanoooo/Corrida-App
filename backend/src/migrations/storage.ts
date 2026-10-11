import { Pool, RowDataPacket } from "mysql2/promise";
import {UmzugStorage} from "umzug"

  export const storage : UmzugStorage<Pool>= {
    async logMigration ({name:nome, context: pool}){
      await pool.query( "INSERT INTO migrations (nome) VALUES (?)", [nome]);
    },
    async unlogMigration({name: nome, context: pool}){
      await pool.query("DELETE FROM migrations WHERE nome = ?", [nome]);
    },
    async executed({context: pool}){
      const [rows] = await pool.query<RowDataPacket[]>("SELECT nome FROM migrations");
      return rows.map(row => row.nome)
    }  }
  