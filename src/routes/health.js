import express from "express";
import { healthCheck } from "../app/controllers/HealthController.js";

const router = express.Router();

router.get("/", healthCheck);

export default router;
