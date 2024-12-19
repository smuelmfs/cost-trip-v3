import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../models/User";
import { Resend } from "resend";
import { generateDetailedGuide } from "@/lib/openai";

// Configuração para garantir que o corpo seja "raw"
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});
const resend = new Resend(process.env.RESEND_API_KEY);

// Função auxiliar para capturar o corpo "raw"
async function buffer(readable: ReadableStream<Uint8Array> | null) {
  if (!readable) {
    throw new Error("ReadableStream is null");
  }
  const reader = readable.getReader();
  const chunks = [];
  let done = false;

  while (!done) {
    const { done: isDone, value } = await reader.read();
    done = isDone;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  try {
    // Obter o corpo raw
    const buf = await buffer(req.body);

    let event;
    try {
      // Validar a assinatura do webhook
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_SECRET_WEBHOOK!);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Webhook signature verification failed.", err.message);
        return new Response("Webhook signature verification failed.", { status: 400 });
      } else {
        console.error("Unknown error during webhook signature verification.", err);
        return new Response("Unknown error", { status: 400 });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Inicie o processamento de forma assíncrona (não bloqueia o retorno ao Stripe)
      processWebhookEvent(session).catch((err) => {
        console.error("Erro ao processar o webhook:", err);
      });
    }

    // Retorne imediatamente ao Stripe
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Unexpected error:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function processWebhookEvent(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata!;
    console.log("Received session metadata:", metadata);

    // Conectar ao MongoDB
    await connectDB();
    console.log("Connected to MongoDB.");

    // Gerar conteúdo com OpenAI
    const documentContent = await generateDetailedGuide({
      userName: metadata.userName,
      destination: metadata.destination,
      days: metadata.days,
      people: metadata.people,
      travelStyle: metadata.travelStyle,
      includeTransport: metadata.includeTransport === "true" ? "true" : "false",
      transportType: metadata.transportType,
      includeMeals: metadata.includeMeals ? "true" : "false",
    });

    // Salvar no banco de dados
    const user = await User.create({
      email: metadata.userEmail,
      data: metadata,
      documentContent: JSON.stringify(documentContent),
    });
    console.log("Saved user to MongoDB:", user);

    // Enviar e-mail com link
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: metadata.userEmail,
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
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Seu Guia de Viagem está Pronto!</h1>
              </div>
              <div style="padding: 20px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">Olá <strong>${metadata.userName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">
                  Estamos felizes em informar que o seu guia de viagem foi gerado com sucesso! 
                  Agora você pode acessar todos os detalhes diretamente através do link abaixo:
                </p>
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
              <div style="background-color: #343a40; color: #ffffff; padding: 10px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">Obrigado por usar nosso serviço!</p>
                <p style="margin: 0;">Equipe Costimizer</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log("E-mail enviado para:", metadata.userEmail);
  } catch (err) {
    console.error("Erro ao processar evento:", err);
  }
}