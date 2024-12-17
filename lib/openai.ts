import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateDetailedGuide(data: {
  userName: string;
  destination: string;
  days: string;
  people: string;
  travelStyle: string;
  includeTransport: string;
  transportType?: string;
  includeMeals: string;
  mealType?: string;
}): Promise<any> {
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

  const MAX_DAYS = 30;
  const adjustedDays = Math.min(parseInt(days), MAX_DAYS);

  const transportInfo = includeTransport
    ? `Include Transport: Yes (${transportType || "General transport"})`
    : "Include Transport: No";

  const mealInfo = includeMeals
    ? `Include Meals: Yes (${mealType || "General meal options"})`
    : "Include Meals: No";

  // Create a skeleton for the travel guide
  const travelGuideSkeleton = createTravelGuideSkeleton(adjustedDays);

  const prompt = `
You are a professional travel guide and a local citizen from ${destination}. Generate a detailed travel guide in JSON format for the following client:

Client Name: ${userName}
Destination: ${destination}
Duration: ${adjustedDays} days (IMPORTANT: DO NOT exceed 30 days)
Number of People: ${people}
Travel Style: ${travelStyle}
${transportInfo}
${mealInfo}

### Instructions:
1. Complete the provided "itinerary" object with activities for each day (morning, afternoon, evening). **Limit to 2-3 activities per time period for itineraries longer than 15 days.**
2. For "practicalInfo", "cultureEtiquette", and "emergency" sections:
   - Each **sectionTitle** must have between **1 and 6 valid details**.
   - The details must be concise, relevant, and realistic. Avoid redundancy.
3. Ensure all fields are filled out. Do not include placeholders like "..." or "TBD".
4. Your output must be a **valid JSON** ready for parsing.
5. Just do your job, the limit of days is 30 days, COMPLETE all days with activities. The client need activities in the days, you are not answering me someone in a chat so don't generate something like '. . . continue for the next few days' this is your REAL job

### Skeleton for Travel Guide:
${JSON.stringify(travelGuideSkeleton, null, 2)}

### Validation Requirements:
- All **${adjustedDays} days** must be fully detailed with morning, afternoon, and evening activities.
- The "practicalInfo", "cultureEtiquette", and "emergency" sections must have between **1 and 6 details** per sectionTitle.
- Output must be valid JSON and ready for parsing.
`;

  try {
    let attempts = 0;

    while (attempts < 3) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
      });

      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content returned from OpenAI API.");
      }

      // Sanitize JSON to remove invalid content
      const sanitizedContent = content
        .replace(/\/\/.*$/gm, "") // Remove comments
        .replace(/\,(?=\s*?[\}\]])/g, ""); // Remove trailing commas

      try {
        const structuredResponse = JSON.parse(sanitizedContent.trim());

        // Validate that the guide matches the skeleton structure
        const validatedResponse = validateGuideCompletion(
          structuredResponse,
          travelGuideSkeleton
        );

        return validatedResponse;
      } catch (error) {
        console.warn("Validation failed. Retrying...");
        attempts++;
      }
    }

    throw new Error("Failed to generate a valid travel guide after multiple attempts.");
  } catch (error) {
    console.error("Error generating travel guide:", error);
    throw new Error("Failed to generate travel guide.");
  }
}

// Create a skeleton for the entire travel guide
function createTravelGuideSkeleton(days: number): any {
  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      dayTitle: `Day ${i}`,
      morning: [],
      afternoon: [],
      evening: [],
    });
  }

  const practicalInfo = [
    { sectionTitle: "Transportation", details: [] },
    { sectionTitle: "Currency", details: [] },
    { sectionTitle: "Weather", details: [] },
    { sectionTitle: "Language", details: [] },
    { sectionTitle: "Shopping Tips", details: [] },
  ];

  const cultureEtiquette = [
    { sectionTitle: "Greetings", details: [] },
    { sectionTitle: "Dining Etiquette", details: [] },
    { sectionTitle: "Dress Code", details: [] },
    { sectionTitle: "Social Customs", details: [] },
    { sectionTitle: "Museums and Monuments", details: [] },
  ];

  const emergency = [
    { sectionTitle: "Emergency Numbers", details: [] },
    { sectionTitle: "Pharmacies", details: [] },
    { sectionTitle: "Hospitals", details: [] },
    { sectionTitle: "Embassy Contact", details: [] },
    { sectionTitle: "Safety Tips", details: [] },
    { sectionTitle: "Useful Phrases in an Emergency", details: [] },
  ];

  return { itinerary, practicalInfo, cultureEtiquette, emergency };
}

// Validate that the guide matches the skeleton structure
function validateGuideCompletion(guide: any, skeleton: any): any {
  if (!guide || typeof guide !== "object") throw new Error("Invalid guide structure");

  // Validate "itinerary" completion
  if (!Array.isArray(guide.itinerary) || guide.itinerary.length !== skeleton.itinerary.length) {
    throw new Error("Itinerary does not match the expected number of days.");
  }

  // Ensure all activities are filled
  guide.itinerary.forEach((day: any, index: number) => {
    if (!day.morning?.length || !day.afternoon?.length || !day.evening?.length) {
      throw new Error(`Day ${index + 1} is incomplete in the itinerary.`);
    }
  });

  // Validate sections with flexibility (1-6 details)
  const sections = ["practicalInfo", "cultureEtiquette", "emergency"];
  for (const section of sections) {
    if (
      !Array.isArray(guide[section]) ||
      guide[section].some(
        (item: any) => !item.details || item.details.length < 1 || item.details.length > 6
      )
    ) {
      throw new Error(
        `Section "${section}" must include between 1 and 6 details for each sectionTitle.`
      );
    }
  }

  return guide;
}
