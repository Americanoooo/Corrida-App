import pool from "../db";
import { Request, Response } from "express";


export async function getHealth(req: Request, res:Response){

    try{
         await pool.query(
        'SELECT 1'
    )
    res.status(200).json({
        status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()})
    }catch(err:unknown){
        res.status(500).json({status: 'error',
      database: 'disconnected'})
    }
}