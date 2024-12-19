import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Tentando conectar ao MongoDB...");
    if (mongoose.connections[0].readyState) {
      console.log("MongoDB já está conectado.");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log("Conectado ao MongoDB com sucesso.");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    throw new Error("Falha na conexão com o MongoDB");
  }
};

export default connectDB;
