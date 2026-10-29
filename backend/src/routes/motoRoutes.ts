import { Router } from "express";
import { getMoto, patchMoto, postMoto } from "../controllers/motoController";
import { deletarMotoPecas, getMotoPecas, patchMotoPecas, postMotoPeca, postPecaVincularMoto } from "../controllers/motoPecaController";
import { getCorridaId, postCorrida } from "../controllers/corridaController";
import { autenticar } from "../autenticar";
import { deletePeca } from "../controllers/pecaController";

const router = Router()

router.get('/', autenticar, getMoto)
router.post('/',  autenticar, postMoto)
router.post('/:motoId/pecas', autenticar, postMotoPeca)
router.post('/:motoId/pecas/criar', autenticar, postPecaVincularMoto)
router.get('/:motoId/pecas', autenticar, getMotoPecas)
router.post('/:motoId/corridas', autenticar, postCorrida)
router.patch('/:motoId', autenticar, patchMoto)
router.patch('/:motoId/pecas/:pecaId', autenticar, patchMotoPecas)
router.delete('/:motoId/pecas/:pecaId', autenticar, deletarMotoPecas)



export default router