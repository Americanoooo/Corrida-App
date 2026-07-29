import { Router } from "express";
import { getPeca, postPeca } from "../controllers/pecaController";

const router = Router();

router.post('/', postPeca)
router.get('/', getPeca)

export default router