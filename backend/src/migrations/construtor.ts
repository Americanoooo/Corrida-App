import pool from "../db"
import { storage } from "./storage"
import {Umzug} from "umzug"


const umzug = new Umzug({
  migrations: {glob: 'src/migrations/nome/*.ts'},
  context: pool,
  storage: storage,
  logger: console,
})

async function rodarMigrations(){
 try{
  await umzug.up();
}catch(err){
  console.error(err)
}finally{
  await pool.end();

}
}

rodarMigrations()