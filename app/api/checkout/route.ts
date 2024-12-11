import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
    } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create`,
      metadata: {
        userName,
        userEmail,
        destination,
        days,
        people,
        travelStyle,
        includeTransport,
        transportType: includeTransport ? transportType : null,
        includeMeals,
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
