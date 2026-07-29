import { Router } from "express";
import { postLogin, postUsuario } from "../controllers/usuarioController";

const router = Router();

router.post('/cadastrar', postUsuario)
router.post('/login', postLogin)

export default router