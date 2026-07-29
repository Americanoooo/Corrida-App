import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();


const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT}= process.env

if(!DB_HOST|| !DB_NAME|| !DB_PASSWORD|| !DB_PORT|| !DB_USER){
    throw new Error('Variáveis de ambiemte do banco não configuradas. Confira o .env')
}

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT) || 3306,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0,
});

export default pool;