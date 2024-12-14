import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true },
  data: { type: Object, required: true },
  documentContent: { type: Object, required: true }, // Salva o JSON como objeto
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);
export default User;
