import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const plan = {
  title: "Acesso Completo",
  price: 29.90,
  description:
    "Tenha acesso ilimitado ao gerador de custos e crie orçamentos detalhados para suas viagens.",
  buttonText: "Comece Agora",
  benefitList: [
    "Criação de guias personalizados de viagem",
    "Cálculo detalhado de custos",
    "Sugestões de transporte e alimentação",
    "Planejamento otimizado para o destino",
  ],
};

export const PricingSection = () => {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Preço
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Obtenha seu Guia de Viagem Personalizado
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
        Pague apenas uma vez e tenha tudo o que você precisa para planejar sua
        viagem de forma simples e rápida.
      </h3>

      <div className="flex justify-center">
        <Card className="drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-primary lg:scale-[1.1]">
          <CardHeader>
            <CardTitle className="pb-2">{plan.title}</CardTitle>

            <CardDescription className="pb-4">
              {plan.description}
            </CardDescription>

            <div>
              <span className="text-3xl font-bold">R$ {plan.price}</span>
              <span className="text-muted-foreground"> pagamento único</span>
            </div>
          </CardHeader>

          <CardContent className="flex">
            <div className="space-y-4">
              {plan.benefitList.map((benefit) => (
                <span key={benefit} className="flex">
                  <Check className="text-primary mr-2" />
                  <h3>{benefit}</h3>
                </span>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="default" className="w-full" asChild>
              <a href="/create">{plan.buttonText}</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};
