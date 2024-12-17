import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="p-8 text-center bg-card border rounded-lg shadow-lg max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Pagamento Realizado com Sucesso!
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Obrigado pelo pagamento! Seu guia de viagem será enviado para o seu e-mail em breve. 
          Aproveite a experiência e prepare-se para sua próxima aventura! 🚀
        </p>
        <div className="space-y-4">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/">
              Voltar para a Página Inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
