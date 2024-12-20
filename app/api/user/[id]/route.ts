import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import db from "@/lib/firebase";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`Fetching user data for ID: ${params.id}`); // Log para depuração

    // Busca o usuário no Firestore
    const docRef = doc(db, "users", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`User not found for ID: ${params.id}`); // Log para casos de não encontrado
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = docSnap.data();

    // Validação adicional para garantir que os dados esperados estão presentes
    if (!user.data || !user.documentContent) {
      console.error(`Incomplete user data for ID: ${params.id}`);
      return NextResponse.json({ error: "Incomplete user data" }, { status: 500 });
    }

    console.log(`User data fetched successfully for ID: ${params.id}`); // Log de sucesso

    return NextResponse.json({
      data: user.data, // Retorna os metadados
      documentContent: user.documentContent, // Retorna o guia completo
    });
  } catch (error) {
    console.error(`Error fetching user data for ID: ${params.id}`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
