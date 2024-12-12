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
  You are a professional travel guide and a local citizen from ${destination}. Generate a detailed and professional travel guide for the following client:

  Client Name: ${userName}
  Destination: ${destination}
  Duration: ${days} days
  Number of People: ${people}
  Travel Style: ${travelStyle}
  Include Transport: ${includeTransport ? `Yes (${transportType})` : "No"}
  Include Meals: ${includeMeals ? "Yes" : "No"}

  The guide should be structured into the following sections, each containing specific, actionable information that a traveler can use during their trip:

  1. "itinerary" (Detailed day-by-day plan):
     For each day, include:
     - A theme or focus for the day
     - Morning, afternoon, and evening activities
     - Specific attractions to visit with brief descriptions
     - Recommended restaurants or cafes for meals
     - Tips for timing and avoiding crowds
     - Estimated costs for activities and meals

  2. "practicalInfo" (Practical Information):
     - Transportation: Detailed explanation of local transport options, costs, and how to use them
     - Money: Currency information, tipping customs, where to exchange money, and credit card acceptance
     - Weather: Seasonal variations, what to pack, and any weather-related precautions
     - Language: Key phrases with phonetic pronunciations, language etiquette
     - Electricity: Voltage, plug types, and adapter recommendations
     - Shopping: Popular shopping areas, opening hours, and tax refund information for tourists

  3. "cultureEtiquette" (Cultural Tips and Etiquette):
     - Greetings: Proper ways to greet locals in various situations
     - Dining etiquette: Table manners, restaurant customs, and food-related traditions
     - Dress code: Appropriate attire for different settings (casual, religious sites, upscale venues)
     - Social norms: Public behavior expectations, taboos to avoid
     - Local customs: Unique cultural practices visitors should be aware of
     - Respect for local sites: Etiquette for visiting monuments, temples, or other significant locations

  4. "emergency" (Emergency Information):
     - Emergency numbers: Police, ambulance, fire department
     - Hospitals: List of hospitals with English-speaking staff
     - Pharmacies: How to find 24-hour pharmacies
     - Embassy information: Contact details for major embassies
     - Common scams: Warnings about typical tourist scams and how to avoid them
     - Natural disasters: Information on potential natural hazards and what to do in case of emergency
     - Useful phrases: Emergency-related phrases in the local language

  Each section should provide rich, detailed content that goes beyond general advice. Include specific names of places, streets, or landmarks where applicable. Offer insider tips that can enhance the travel experience. Ensure that the information is current and accurate for ${new Date().getFullYear()}.

  Format the guide as a JSON object with the following structure:

  {
    "itinerary": "Detailed day-by-day itinerary as described above.",
    "practicalInfo": "Practical tips and details as described above.",
    "cultureEtiquette": "Cultural norms and etiquette as described above.",
    "emergency": "Emergency contacts and safety tips as described above."
  }

  The tone should be informative yet engaging, as if written by a knowledgeable local guide. Include occasional anecdotes or interesting facts about the destination to make the guide more captivating. Tailor the content to ${destination}'s unique characteristics, highlighting what makes this place special and how travelers can best experience its culture, cuisine, and attractions.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) {
      const structuredResponse = JSON.parse(content.trim());
      return structuredResponse;
    } else {
      throw new Error("No valid choices returned from OpenAI API.");
    }
  } catch (error) {
    console.error("Error generating travel guide:", error);
    throw new Error("Failed to generate travel guide.");
  }
}