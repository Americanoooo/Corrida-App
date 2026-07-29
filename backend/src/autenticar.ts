import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config"



export function autenticar(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message: 'Token não fornecido'})
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Token não fornecido'})
    }
    try{
        const payload = jwt.verify(token, JWT_SECRET as string);
        if(typeof payload==="string"){
            return res.status(401).json({message: 'Token inválido'})
        }
        req.usuario_id = payload.usuario_id as number;
        next();
    }catch(err){
    return res.status(401).json({message: 'Token inválido'})

    }
}