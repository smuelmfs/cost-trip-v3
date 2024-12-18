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
        includeTransport: includeTransport === "true" ? "true" : "false",
        transportType,
        includeMeals: includeMeals ? "true" : "false",
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
        subject: "Seu Guia de Viagem está Pronto!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Guia de Viagem</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
              <!-- Container Principal -->
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <div style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Seu Guia de Viagem está Pronto!</h1>
                </div>
      
                <!-- Conteúdo -->
                <div style="padding: 20px; color: #333333;">
                  <p style="font-size: 16px; line-height: 1.6;">
                    Olá <strong>${userName}</strong>,
                  </p>
                  <p style="font-size: 16px; line-height: 1.6;">
                    Estamos felizes em informar que o seu guia de viagem foi gerado com sucesso! 
                    Agora você pode acessar todos os detalhes diretamente através do link abaixo:
                  </p>
      
                  <!-- Botão -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${user._id}"
                      style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                      Acessar o Seu Guia
                    </a>
                  </div>
      
                  <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 20px;">
                    Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
                  </p>
      
                  <p style="font-size: 14px; color: #007bff; word-wrap: break-word; text-align: center;">
                    ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${user._id}
                  </p>
                </div>
      
                <!-- Footer -->
                <div style="background-color: #343a40; color: #ffffff; padding: 10px; text-align: center; font-size: 12px;">
                  <p style="margin: 0;">Obrigado por usar nosso serviço!</p>
                  <p style="margin: 0;">Equipe Costimizer</p>
                </div>
              </div>
            </body>
          </html>
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
