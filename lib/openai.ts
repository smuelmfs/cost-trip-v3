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
  mealType?: string;
}) {
  const {
    userName,
    destination,
    days,
    people,
    travelStyle,
    includeTransport,
    transportType,
    includeMeals,
    mealType,
  } = data;

  // Criar seções dinâmicas do prompt
  const transportInfo = includeTransport
    ? `Include Transport: Yes (${transportType || "General transport"})`
    : "Include Transport: No";

  const mealInfo = includeMeals
    ? `Include Meals: Yes (${mealType || "General meal options"})`
    : "Include Meals: No";

  const prompt = `
You are a professional travel guide and a local citizen from ${destination}. Generate a detailed travel guide in JSON format for the following client:

Client Name: ${userName}
Destination: ${destination}
Duration: ${days} days
Number of People: ${people}
Travel Style: ${travelStyle}
${transportInfo}
${mealInfo}

### Instructions:
1. Create a JSON object.
2. Fill **all days** of the itinerary completely. Do not leave placeholders or comments—just do your guide job. Each day must include activities for morning, afternoon, and evening.
3. Use concise but detailed descriptions.

### Example Output:

{
  "itinerary": [
    { "dayTitle": "Day 1: Arrival & Sightseeing", "morning": ["Activity 1"], "afternoon": ["Activity 2"], "evening": ["Activity 3"] },
    { "dayTitle": "Day 2: Explore Culture", "morning": ["Activity A"], "afternoon": ["Activity B"], "evening": ["Activity C"] }
  ],
  "practicalInfo": [
    { "title": "Transportation", "description": "Details about transport." },
    { "title": "Money", "description": "Details about currency." },
    { "title": "Weather", "description": "Details about weather." },
    { "title": "Language", "description": "Details about language." },
    { "title": "Electricity", "description": "Details about electricity." },
    { "title": "Shopping", "description": "Details about shopping." }
  ],
  "cultureEtiquette": [
    { "title": "Greetings", "description": "Details about greetings." },
    { "title": "Dining Etiquette", "description": "Details about dining etiquette." },
    { "title": "Dress Code", "description": "Details about dress code." },
    { "title": "Public Behavior", "description": "Details about public behavior." },
    { "title": "Respect for Local Sites", "description": "Details about respecting local sites." }
  ],
  "emergency": [
    { "title": "Emergency Numbers", "description": "Details about emergency numbers." },
    { "title": "Hospitals", "description": "Details about hospitals." },
    { "title": "Pharmacies", "description": "Details about pharmacies." },
    { "title": "Common Scams", "description": "Details about common scams." },
    { "title": "Embassy Contact", "description": "Details about embassy contact." },
    { "title": "Useful Phrases in Emergencies", "description": "Details about useful phrases." }
  ]
}

### Generate the JSON:
- Ensure there are no comments or placeholders in the output.
- Fill all days (${days}) of the itinerary based on the destination.
- Validate the JSON format before outputting.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000, // Ajuste para limitar a quantidade de texto retornado
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI API.");
    }

    // Log the raw content for debugging purposes
    console.log("Raw OpenAI Response:", content);

    // Remove comentários e corrigir vírgulas finais inválidas
    const sanitizedContent = content
      .replace(/\/\/.*$/gm, "") // Remove comentários
      .replace(/\,(?=\s*?[\}\]])/g, ""); // Remove vírgulas finais extras

    // Validate if the sanitized content is valid JSON
    let structuredResponse;
    try {
      structuredResponse = JSON.parse(sanitizedContent.trim());
    } catch (error) {
      console.error("Invalid JSON after sanitization:", sanitizedContent);
      throw new Error("OpenAI returned invalid JSON.");
    }

    return structuredResponse;
  } catch (error) {
    console.error("Error generating travel guide:", error);
    throw new Error("Failed to generate travel guide.");
  }
}