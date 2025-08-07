import UserModel from "../models/UserModel.js";
import ContactModal from "../models/ContactModel.js";

import { emitAddedContact } from "../../utils/socket.js";

export const addContact = async (req, res) => {
  const userId = req.user._id;
  const { email, username } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You're not authenticated",
      });
    }
    const receiver = await UserModel.findOne({ email, username });
    if (!receiver) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or username" });
    }
    if (user.contacts.includes(receiver._id)) {
      return res.status(400).json({
        success: false,
        message: "This user is already in your contacts.",
      });
    }
    const newContact = new ContactModal({
      sender: userId,
      receiver: receiver._id,
    });
    await newContact.save();

    const socketData = {
      contactId: newContact._id,
      avatar: user.avatar,
      username: user.username,
    };

    const io = req.app.get("io");
    emitAddedContact(io, socketData);

    return res.status(200).json({
      success: true,
      message: "Add contact successful",
      data: newContact,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const responseContact = async (req, res) => {
  const userId = req.user._id;
  const { contactId, status } = req.body; // Lấy contactId và status từ body
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You're not authenticated",
      });
    }

    // Tìm lời mời kết bạn
    const contact = await ContactModal.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found",
      });
    }

    // Chỉ người nhận mới được phản hồi
    if (contact.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to respond to this request",
      });
    }

    if (!["success", "denied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    contact.status = status;
    await contact.save();

    // Nếu chấp nhận, thêm vào danh sách bạn bè của cả hai
    if (status === "success") {
      await UserModel.findByIdAndUpdate(contact.sender, {
        $addToSet: { contacts: contact.receiver },
      });
      await UserModel.findByIdAndUpdate(contact.receiver, {
        $addToSet: { contacts: contact.sender },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contact request has been ${
        status === "success" ? "accepted" : "denied"
      }`,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
