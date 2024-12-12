import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("MongoDB already connected.");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw new Error("MongoDB connection failed");
  }
};

export default connectDB;
