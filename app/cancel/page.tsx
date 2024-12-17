import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="p-8 text-center bg-card border rounded-lg shadow-lg max-w-md">
        <div className="flex justify-center mb-6">
          <XCircle className="text-red-500 w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-destructive mb-4">Pagamento Falhou</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Ocorreu um problema com o pagamento. Não se preocupe, você pode tentar novamente. 😊
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
