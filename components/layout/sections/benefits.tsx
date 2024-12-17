import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Map",
    title: "Roteiros Personalizados",
    description:
      "Receba um roteiro detalhado com atividades divididas entre manhã, tarde e noite, adaptado ao destino e ao número de dias da sua viagem.",
  },
  {
    icon: "Calculator",
    title: "Cálculo de Custos Precisos",
    description:
      "Obtenha um resumo completo dos custos estimados da viagem com base nas suas preferências e estilo de viagem.",
  },
  {
    icon: "Plane",
    title: "Planejamento Simplificado",
    description:
      "Planeje sua viagem sem complicação. Informe o destino, a quantidade de dias e o estilo de viagem, e nós fazemos o resto.",
  },
  {
    icon: "ClipboardCheck",
    title: "Organização Completa",
    description:
      "Tenha todas as informações da viagem organizadas em um só lugar, incluindo roteiros e custos gerados.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Benefícios</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Facilite o Planejamento da Sua Viagem
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Nosso sistema gera roteiros personalizados e calcula os custos estimados da sua viagem
            de maneira rápida, prática e organizada.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
