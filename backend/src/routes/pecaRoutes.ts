import { Router } from "express";
import { deletePeca, patchPeca, getPeca, postPeca } from "../controllers/pecaController";
import { autenticar } from "../autenticar";

const router = Router();

router.post('/', autenticar, postPeca)
router.get('/',autenticar , getPeca)
router.delete('/:pecaId', autenticar, deletePeca)
router.patch('/:pecaId', autenticar, patchPeca)

export default router