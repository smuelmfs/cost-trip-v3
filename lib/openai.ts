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
You are a professional travel guide and a local citizen from ${destination}. Generate a detailed travel guide in JSON format for the following client:

Client Name: ${userName}
Destination: ${destination}
Duration: ${days} days
Number of People: ${people}
Travel Style: ${travelStyle}
Include Transport: ${includeTransport ? `Yes (${transportType})` : "No"}
Include Meals: ${includeMeals ? "Yes" : "No"}

### Output the result as a JSON object with the following structure:

{
  "itinerary": [
    { "dayTitle": "Day 1: Example Title", "activities": ["Activity 1", "Activity 2"] },
    { "dayTitle": "Day 2: Another Title", "activities": ["Activity 1", "Activity 2"] }
  ],
  "practicalInfo": [
    { "title": "Transportation", "description": "Details about transport options." },
    { "title": "Currency", "description": "Details about currency and exchange rates." }
  ],
  "cultureEtiquette": [
    { "title": "Greetings", "description": "Details about local greetings." },
    { "title": "Dining Etiquette", "description": "Details about dining culture." }
  ],
  "emergency": [
    { "title": "Emergency Numbers", "description": "Details about emergency contacts." },
    { "title": "Hospitals", "description": "Details about nearby hospitals." }
  ]
}

Provide concise but detailed content for each field. Ensure proper JSON formatting.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI API.");
    }

    // Log the raw content for debugging purposes
    console.log("Raw OpenAI Response:", content);

    // Validate if the content is valid JSON
    let structuredResponse;
    try {
      structuredResponse = JSON.parse(content.trim());
    } catch (error) {
      console.error("Invalid JSON:", content);
      throw new Error("OpenAI returned invalid JSON.");
    }

    return structuredResponse;
  } catch (error) {
    console.error("Error generating travel guide:", error);
    throw new Error("Failed to generate travel guide.");
  }
}