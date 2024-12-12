import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../models/User";
import { Resend } from "resend";
import { generateDetailedGuide } from "@/lib/openai";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const payload = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_SECRET_WEBHOOK!);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Webhook Error", { status: 400 });
  }

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
      includeTransport,
      transportType,
      includeMeals,
    } = metadata;

    try {
      console.log("Received session metadata:", metadata);

      // Conectar ao MongoDB
      await connectDB();
      console.log("Connected to MongoDB.");

      // Gerar conteúdo com OpenAI
      const documentContent = await generateDetailedGuide({
        userName,
        destination,
        days,
        people,
        travelStyle,
        includeTransport: includeTransport === "true",
        transportType,
        includeMeals: includeMeals === "true",
      });

      // Salvar no banco de dados
      const user = await User.create({
        email: userEmail,
        data: metadata,
        documentContent: JSON.stringify(documentContent), // Serialização do conteúdo como JSON
      });            
      console.log("Saved user to MongoDB:", user);

      // Enviar e-mail com link para o dashboard
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: userEmail,
        subject: "Your Travel Guide is Ready!",
        html: `
          <p>Hi ${userName},</p>
          <p>Your travel guide is ready! You can access it using the link below:</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${user._id}">Access Your Dashboard</a></p>
        `,
      });
      console.log("Email sent to:", userEmail);
    } catch (err) {
      console.error("Error processing webhook:", err);
      return new Response("Webhook Processing Error", { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
