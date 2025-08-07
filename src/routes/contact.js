import express from "express";

import { addContact,responseContact } from "../app/controllers/ContactController.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();
router.post("/response", verifyToken, responseContact);
router.post("/add", verifyToken, addContact);

export default router;
