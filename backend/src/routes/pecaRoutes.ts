import { Router } from "express";
import { getPeca, postPeca } from "../controllers/pecaController";
import { autenticar } from "../autenticar";

const router = Router();

router.post('/', autenticar, postPeca)
router.get('/', autenticar, getPeca)

export default router