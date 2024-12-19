import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../models/User";
import { Resend } from "resend";
import { generateDetailedGuide } from "@/lib/openai";

// Configuração para o runtime de Node.js
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});
const resend = new Resend(process.env.RESEND_API_KEY);

// Função auxiliar para capturar o corpo "raw"
async function buffer(readable: ReadableStream<Uint8Array> | null) {
  if (!readable) {
    console.error("ReadableStream is null");
    throw new Error("ReadableStream is null");
  }
  const reader = readable.getReader();
  const chunks = [];
  let done = false;

  while (!done) {
    const { done: isDone, value } = await reader.read();
    done = isDone;
    if (value) {
      console.log("Chunk lido do corpo:", value);
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  console.log("Recebendo requisição no webhook...");
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Faltando assinatura do Stripe.");
    return new Response("Missing Stripe signature", { status: 400 });
  }

  try {
    console.log("Iniciando leitura do corpo...");
    const buf = await buffer(req.body);
    console.log("Corpo recebido:", buf.toString());

    let event;
    try {
      console.log("Verificando assinatura do webhook...");
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_SECRET_WEBHOOK!);
      console.log("Evento verificado com sucesso:", event.type);
    } catch (err) {
      console.error("Falha na verificação da assinatura do webhook:", err);
      return new Response("Webhook signature verification failed.", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      console.log("Evento 'checkout.session.completed' recebido.");
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Dados da sessão:", session);
      processWebhookEvent(session).catch((err) => console.error("Erro ao processar o webhook:", err));
    } else {
      console.log("Tipo de evento ignorado:", event.type);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Erro inesperado no webhook:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function processWebhookEvent(session: Stripe.Checkout.Session) {
  try {
    console.log("Iniciando processamento do evento...");
    const metadata = session.metadata!;
    console.log("Metadados recebidos:", metadata);

    console.log("Conectando ao MongoDB...");
    await connectDB();
    console.log("Conexão com MongoDB bem-sucedida.");

    console.log("Gerando guia detalhado com OpenAI...");
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
    console.log("Guia gerado:", documentContent);

    console.log("Salvando usuário no MongoDB...");
    const user = await User.create({
      email: metadata.userEmail,
      data: metadata,
      documentContent: JSON.stringify(documentContent),
    });
    console.log("Usuário salvo no MongoDB:", user);

    console.log("Enviando e-mail...");
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