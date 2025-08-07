import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  status: {
    type: String,
    enum: ["success", "denied", "pending"],
    default: "pending",
  },
});

const ContactModel = mongoose.model("contacts", ContactSchema);

export default ContactModel;
