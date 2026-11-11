import { Router } from "express";
import { deletePeca, editarNomePeca, getPeca, postPeca } from "../controllers/pecaController";
import { autenticar } from "../autenticar";

const router = Router();

router.post('/', autenticar, postPeca)
router.get('/',autenticar , getPeca)
router.delete('/:pecaId', autenticar, deletePeca)
router.patch('/:pecaId', autenticar, editarNomePeca)

export default router