import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "O que é o Costimizer?",
    answer:
      "O Costimizer é uma ferramenta que gera guias personalizados e calcula os custos detalhados para sua viagem. Basta inserir os detalhes da sua viagem e receber um plano completo.",
    value: "item-1",
  },
  {
    question: "Como funciona o gerador de custos de viagem?",
    answer:
      "Você informa o destino, o número de dias, as preferências de transporte e alimentação. O sistema calcula os custos com base nesses detalhes e gera um guia otimizado para a viagem.",
    value: "item-2",
  },
  {
    question: "Preciso pagar alguma assinatura?",
    answer:
      "Não. O Costimizer funciona com um pagamento único de R$ 29,90. Após o pagamento, você terá acesso completo ao guia gerado para a sua viagem.",
    value: "item-3",
  },
  {
    question: "Posso personalizar as opções da viagem?",
    answer:
      "Sim! O Costimizer permite personalizar opções de transporte, refeições e estilo de viagem, garantindo um guia alinhado às suas preferências e orçamento.",
    value: "item-4",
  },
  {
    question: "Como recebo o guia de viagem?",
    answer:
      "O guia gerado estará disponível imediatamente após o pagamento. Você pode acessá-lo por meio de um link exclusivo enviado para o seu e-mail.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          Perguntas Frequentes
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Tire suas dúvidas
        </h2>
      </div>

      <Accordion type="single" collapsible>
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
