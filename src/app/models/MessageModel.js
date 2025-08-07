import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({},{ timestamps: true });

const MessageModel = mongoose.model("messages", MessageSchema);

export default MessageModel;
