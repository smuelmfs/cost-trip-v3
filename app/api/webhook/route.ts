import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../models/User";
import { Resend } from "resend";
import { generateDetailedGuide } from "@/lib/openai";
import { generatePDF } from "@/lib/pdf";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const payload = await req.text();

  let event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_SECRET_WEBHOOK!);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Webhook signature verification failed.", err.message);
    } else {
      console.error("Webhook signature verification failed.", err); // Handle non-Error cases
    }
    return new Response("Webhook Error", { status: 400 });
  }

  // Processar evento de pagamento confirmado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata!;
    const {
      userName,
      userEmail,
      destination,
      days,
      people,
      travelStyle,
      includeTransport: includeTransportString,
      transportType,
      includeMeals: includeMealsString,
    } = metadata;

    // Convert includeTransport and includeMeals to boolean
    const includeTransport = includeTransportString === 'true';
    const includeMeals = includeMealsString === 'true';

    try {
      // Conectar ao MongoDB
      await connectDB();

      // Gerar conteúdo detalhado com a OpenAI
      const documentContent = await generateDetailedGuide({
        userName,
        destination,
        days,
        people,
        travelStyle,
        includeTransport,
        transportType,
        includeMeals,
      });

      // Gerar PDF com o conteúdo gerado
      const pdfPath = await generatePDF(documentContent, `travel-guide-${session.id}`);

      // Salvar no banco de dados
      const user = await User.create({
        email: userEmail,
        data: {
          userName,
          destination,
          days,
          people,
          travelStyle,
          includeTransport,
          transportType,
          includeMeals,
        },
        documentUrl: pdfPath,
      });

      // Enviar e-mail com o link para o PDF
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: userEmail,
        subject: "Your Travel Guide is Ready!",
        html: `
          <p>Hi ${userName},</p>
          <p>Your travel guide is ready! You can download it using the link below:</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/pdfs/${pdfPath}">Download Guide</a></p>
        `,
      });

      console.log("Webhook processed successfully.");
    } catch (err) {
      console.error("Error processing webhook:", err);
      return new Response("Webhook Processing Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
