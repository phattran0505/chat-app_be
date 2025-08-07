import express from "express";
import {
  updateInfo,
  changeStatus,
  updateAvatar,
  forgetPassword,
  resetPassword,
} from "../app/controllers/UserController.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.put("/change", verifyToken, changeStatus);
router.put("/update/info", verifyToken, updateInfo);
router.put("/update/avatar", verifyToken, updateAvatar);

export default router;
