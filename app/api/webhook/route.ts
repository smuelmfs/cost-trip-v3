import Stripe from "stripe";
import { NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore";
import db from "@/lib/firebase";
import { Resend } from "resend";
import { generateDetailedGuide } from "@/lib/openai";
import getRawBody from "raw-body";
import { Readable } from "stream";
import crypto from "crypto";

// Configuração para o runtime de Node.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});
const resend = new Resend(process.env.RESEND_API_KEY);

// Função para gerar hash único
function generateUniqueId(email: string): string {
  const uniqueComponent = `${email}-${Date.now()}`;
  return crypto.createHash("sha256").update(uniqueComponent).digest("hex").slice(0, 16);
}

// Verifica se o evento já foi processado (idempotência)
async function isEventProcessed(eventId: string): Promise<boolean> {
  const eventRef = doc(db, "processedEvents", eventId);
  const eventDoc = await getDoc(eventRef);
  console.log(`Verificando se o evento ${eventId} já foi processado:`, eventDoc.exists());
  return eventDoc.exists();
}

// Marca o evento como processado
async function markEventAsProcessed(eventId: string): Promise<void> {
  const eventRef = doc(db, "processedEvents", eventId);
  console.log(`Marcando o evento ${eventId} como processado.`);
  await setDoc(eventRef, { processedAt: new Date() });
}

export async function POST(req: Request) {
  console.log("Recebendo requisição no webhook...");
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Erro: Stripe signature ausente.");
    return new Response("Missing Stripe signature", { status: 400 });
  }

  try {
    // Converter o corpo para um stream legível
    console.log("Preparando para verificar assinatura do Stripe...");
    const readableBody = Readable.from(req.body as any);

    // Usar `getRawBody` com o stream legível
    const buf = await getRawBody(readableBody, {
      length: req.headers.get("content-length"),
      encoding: "utf-8",
    });

    let event;
    try {
      // Verificar assinatura do webhook
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_SECRET_WEBHOOK!);
      console.log("Evento verificado com sucesso:", event.type);
    } catch (err) {
      console.error("Erro na verificação da assinatura do webhook:", err);
      return new Response("Webhook signature verification failed.", { status: 400 });
    }

    // Verificar e processar o evento
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Processando evento checkout.session.completed...");
      await processWebhookEvent(session);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Erro inesperado no webhook:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function processWebhookEvent(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata!;
    console.log("Metadados recebidos:", metadata);

    // Verificar idempotência do evento
    if (await isEventProcessed(session.id)) {
      console.log(`Evento ${session.id} já processado. Abortando...`);
      return;
    }

    // Validar metadados
    if (!metadata.userEmail || !metadata.userName || !metadata.destination) {
      throw new Error("Metadados inválidos detectados.");
    }

    console.log("Gerando guia de viagem com OpenAI...");
    const documentContent = await generateDetailedGuide({
      userName: metadata.userName,
      destination: metadata.destination,
      days: metadata.days,
      people: metadata.people,
      travelStyle: metadata.travelStyle,
      includeTransport: metadata.includeTransport === "true" ? "true" : "false",
      includeMeals: metadata.includeMeals === "true" ? "true" : "false",
    });
    console.log("Guia gerado com sucesso.");

    const userId = generateUniqueId(metadata.userEmail);
    console.log(`ID único gerado para o usuário: ${userId}`);

    const userData = {
      email: metadata.userEmail,
      data: metadata,
      documentContent,
    };
    console.log("Dados a serem enviados para o Firestore:", userData);

    await setDoc(doc(db, "users", userId), userData);
    console.log(`Usuário salvo no Firestore com ID: ${userId}`);

    await markEventAsProcessed(session.id);
    console.log("Evento marcado como processado.");

    console.log("Enviando e-mail para o usuário...");
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
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${userId}"
                  style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  Acessar o Seu Guia
                </a>
              </div>
              <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 20px;">
                Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="font-size: 14px; color: #007bff; word-wrap: break-word; text-align: center;">
                ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${userId}
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
    console.log("E-mail enviado com sucesso para:", metadata.userEmail);
  } catch (err) {
    console.error("Erro ao processar evento:", err);
  }
}
