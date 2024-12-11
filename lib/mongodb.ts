import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; // Verifica se já está conectado
  await mongoose.connect(process.env.MONGODB_URI as string, {
  });
};

export default connectDB;
