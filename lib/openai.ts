import Configuration from "openai";
import { OpenAI } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Sua chave da OpenAI
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateDetailedGuide(data: {
  userName: string;
  destination: string;
  days: string;
  people: string;
  travelStyle: string;
  includeTransport: boolean;
  transportType?: string;
  includeMeals: boolean;
}) {
  const { userName, destination, days, people, travelStyle, includeTransport, transportType, includeMeals } = data;

  const prompt = `
    You are a professional travel guide. Generate a detailed and professional travel guide for the following client:

    Client Name: ${userName}
    Destination: ${destination}
    Duration: ${days} days
    Number of People: ${people}
    Travel Style: ${travelStyle}
    Include Transport: ${includeTransport ? `Yes (${transportType})` : "No"}
    Include Meals: ${includeMeals ? "Yes" : "No"}

    The guide should include:
    1. A day-by-day itinerary with suggested activities, landmarks to visit, and local experiences.
    2. Packing list tailored for the destination and trip duration.
    3. Transportation details, including how to get to the destination and move around locally.
    4. Meal recommendations, including local cuisine highlights.
    5. Safety tips specific to the destination.
    6. A budget breakdown based on the travel style.
    7. General tips for enjoying the destination, including cultural norms and best times to visit.

    Format the guide in sections with headings and subheadings. Provide detailed, engaging, and actionable content.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Usando o GPT-4
      messages: [{ role: "user", content: prompt }], // Updated structure
      max_tokens: 3000, // Configuração para permitir conteúdo longo
    });

    return response.choices[0].message.content?.trim() || "No content generated.";
  } catch (error) {
    console.error("Error generating travel guide:", error);
    throw new Error("Failed to generate travel guide.");
  }
}
