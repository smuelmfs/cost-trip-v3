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

  const MAX_DAYS = 25;
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
Você é um guia de viagens profissional e cidadão local de ${destination}. Gere um guia de viagem detalhado em formato JSON para o seguinte turista:

Nome do cliente: ${userName}
Destino: ${destination}
Duração: ${adjustedDays} dias (IMPORTANTE: NÃO exceder 25 dias)
Número de pessoas: ${people}
Estilo de viagem: ${travelStyle}
${transportInfo}
${mealInfo}

### Instruções:
1. Preencha o objeto “roteiro” fornecido com as atividades de cada dia (manhã, tarde, noite) e gere quanto mais ou menos o turista gastará na atividade do dia em moeda local (coloque sempre a abreviatura da moeda junto com o valor) . **Limite de 2 a 3 atividades por período para itinerários superiores a 15 dias.**
2. Lembre-se de levar em consideração o estilo de viagem do viajante na hora de criar uma atividade
3. Para as seções "informações práticas", "etiqueta cultural" e "emergência":
   - Cada **sectionTitle** deve ter entre **1 e 6 detalhes válidos**.
   - Os detalhes devem ser concisos, relevantes e realistas. Evite redundância.
4. Certifique-se de que todos os campos estejam preenchidos. Não inclua espaços reservados como "..." ou "TBD".
5. Sua saída deve ser um **JSON válido** pronto para análise.
6. Basta fazer o seu trabalho, o limite de dias é 25 dias, COMPLETAR todos os dias com atividades. O cliente precisa de atividades nos dias, você não está me respondendo alguém no chat então não gere algo como '. . . continue pelos próximos dias' este é o seu trabalho REAL

### Esqueleto para guia o de viagem:
${JSON.stringify(travelGuideSkeleton, null, 2)}

### Requisitos de validação:
- Todos **${adjustedDays} dias** deve ser totalmente detalhado com atividades matinais, vespertinas e noturnas.
- As seções "informações práticas", "etiqueta cultural" e "emergência" devem ter entre **1 e 6 detalhes** por título da seção.
- A saída deve ser JSON válida e pronta para análise.
`;

  try {
    let attempts = 0;

    while (attempts < 3) {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
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
      dayTitle: `Dia ${i}`,
      morning: [],
      afternoon: [],
      evening: [],
    });
  }

  const practicalInfo = [
    { sectionTitle: "Transporte", details: [] },
    { sectionTitle: "Moeda", details: [] },
    { sectionTitle: "Clima", details: [] },
    { sectionTitle: "Língua Local", details: [] },
    { sectionTitle: "Dicas de Compras", details: [] },
  ];

  const cultureEtiquette = [
    { sectionTitle: "Saudações", details: [] },
    { sectionTitle: "Etiqueta de Alimentação", details: [] },
    { sectionTitle: "Código de Vestimenta", details: [] },
    { sectionTitle: "Costumes Sociais", details: [] },
    { sectionTitle: "Museus e Monumentos", details: [] },
  ];

  const emergency = [
    { sectionTitle: "Números de emergência", details: [] },
    { sectionTitle: "Farmácias", details: [] },
    { sectionTitle: "Hospitais", details: [] },
    { sectionTitle: "Contato da Embaixada", details: [] },
    { sectionTitle: "Dicas de segurança", details: [] },
    { sectionTitle: "Frases úteis em uma emergência", details: [] },
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
