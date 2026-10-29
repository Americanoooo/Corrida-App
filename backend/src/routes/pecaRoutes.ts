import { Router } from "express";
import { deletePeca, getPeca, postPeca } from "../controllers/pecaController";
import { autenticar } from "../autenticar";

const router = Router();

router.post('/', autenticar, postPeca)
router.get('/',autenticar , getPeca)
router.patch('/', autenticar, deletePeca)

export default router