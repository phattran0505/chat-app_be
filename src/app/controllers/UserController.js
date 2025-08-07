import UserModel from "../models/UserModel.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { sendMail } from "../../services/MailService.js";

export const updateInfo = async (req, res) => {
  const userId = req.user._id;
  const { username, location, slogan } = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        username,
        location,
        slogan,
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Update info success", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changeStatus = async (req, res) => {
  const { status } = req.query;
  const userId = req.user._id;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        status: status,
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        avatar: avatar,
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Change avatar success", data: user });
  } catch (error) {
    return res.status(200).json({ success: true, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "No account found for this email address. Please enter your email again",
      });
    }
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await sendMail(
      email,
      "Mật khẩu mới của bạn",
      `<p>Xin chào <strong>${user.username}</strong>,</p>
      <p>Hệ thống đã tạo một mật khẩu mới cho tài khoản của bạn trên <strong>ChatApp</strong> theo yêu cầu đặt lại mật khẩu.</p>
      <p><strong>Mật khẩu mới của bạn là:</strong> <span style="color: #15c;">${randomPassword}</span></p>
      <p>Vui lòng đăng nhập bằng mật khẩu này và ngay lập tức thay đổi lại mật khẩu để đảm bảo an toàn.</p>
      <p><strong>Lưu ý: Nếu bạn không thực hiện yêu cầu này, hãy liên hệ ngay với bộ phận hỗ trợ của chúng tôi.</strong></p>
      `
    );

    return res.status(200).json({
      success: true,
      message:
        "Please check your email and login to website with new password.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "The password doesn't match. Please re-enter password",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Reset password successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
