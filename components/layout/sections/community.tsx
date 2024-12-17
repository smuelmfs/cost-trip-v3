import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaneTakeoff } from "lucide-react";

export const CommunitySection = () => {
  return (
    <section id="start" className="py-12">
      <hr className="border-secondary" />
      <div className="container py-20 sm:py-20">
        <div className="lg:w-[60%] mx-auto">
          <Card className="bg-background border-none shadow-none text-center flex flex-col items-center justify-center">
            <CardHeader>
              <CardTitle className="text-4xl md:text-5xl font-bold flex flex-col items-center">
                <PlaneTakeoff size={48} className="text-primary mb-4" />
                <div>
                  Pronto para planejar sua
                  <span className="text-transparent pl-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
                    próxima viagem?
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:w-[80%] text-xl text-muted-foreground">
              Transforme seus planos de viagem em realidade com roteiros
              detalhados e estimativas de custos precisas. É rápido, simples e
              completo!
            </CardContent>

            <CardFooter>
              <Button asChild className="text-lg font-bold px-6 py-3">
                <a href="/create">
                  Comece Agora
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <hr className="border-secondary" />
    </section>
  );
};
