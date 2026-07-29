import { Router } from "express";
import { getMoto, postMoto } from "../controllers/motoController";
import { getMotoPecas, postMotoPeca } from "../controllers/motoPecaController";
import { getCorridaId, postCorrida } from "../controllers/corridaController";
import { autenticar } from "../autenticar";

const router = Router()

router.get('/', autenticar, getMoto)
router.post('/',  autenticar, postMoto)
router.post('/:motoId/pecas', autenticar, postMotoPeca)
router.get('/:motoId/pecas', autenticar, getMotoPecas)
router.post('/:motoId/corridas', autenticar, postCorrida)


export default router