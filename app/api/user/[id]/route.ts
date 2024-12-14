import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../../models/User";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user.toObject());
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
