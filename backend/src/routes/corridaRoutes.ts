import { Router } from "express";
import { excluirCorrida, getCorridaId, getCorridas, getRelatorio } from "../controllers/corridaController";
import { autenticar } from "../autenticar";


const router = Router()

router.get('/relatorio', autenticar, getRelatorio)
router.get('/buscar/:corridaId', autenticar, getCorridaId)
router.get('/', autenticar, getCorridas)
router.delete('/:corridaId', autenticar, excluirCorrida)


export default router