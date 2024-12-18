import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../../models/User";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Validar se o id é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    // Busca o usuário no banco de dados
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: user.data, // Retorna os metadados como travelStyle
      documentContent: user.documentContent, // O guia completo
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
