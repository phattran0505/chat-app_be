import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESSTOKEN_KEY,
    {
      expiresIn: "60s",
    }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.JWT_REFRESHTOKEN_KEY,
    {
      expiresIn: "365d",
    }
  );
};

export const register = async (req, res) => {
  const { email, password, username } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hashSync(password, salt);
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email has been used",
      });
    }

    const newUser = new UserModel({
      email: email,
      username: username,
      password: hash,
    });
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: "Register successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const ismatch = await bcrypt.compare(req.body.password, user.password);
    if (!ismatch) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const firstLogin = user.isFirstLogin;

    if (firstLogin) {
      user.isFirstLogin = false;
      await user.save();
    }

    const { password, role, ...rest } = user._doc;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refresh token in cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: { ...rest, accessToken, isFirstLogin: firstLogin },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  const userId = req.user._id;
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "You're not authenticated" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_KEY, (err, user) => {
      if (err) {
        return res
          .status(404)
          .json({ success: false, message: "Refreshtoken is invalid" });
      }
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

      return res
        .status(200)
        .json({ success: true, accessToken: newAccessToken });
    });
  } catch (error) {
    return res.status(400).json({ success: true, message: error.message });
  }
};
