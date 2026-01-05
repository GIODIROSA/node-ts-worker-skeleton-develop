import {Router} from "express";
import { createEmailJob } from "src/controller/email.controller";

const router = Router();

// POST recibe campaña
router.post("/", createEmailJob);

export default router;

