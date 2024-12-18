import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from 'next/image';

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-8 sm:py-12">
      <div className="p-6 bg-card border border-secondary rounded-2xl text-center">
        {/* Logo e Nome */}
        <div className="flex justify-center items-center mb-6">
          <Image
            width={50}
            height={50}
            className="w-9 h-9 rounded-lg border border-secondary"
            src="/icon.png"
            alt="Costimizer Logo"
          />
          <h3 className="text-2xl font-bold ml-2">Costimizer</h3>
        </div>

        {/* Links principais */}
        <div className="flex justify-center space-x-8 mb-6">
          <Link href="#faq" className="text-muted-foreground hover:text-primary">
            FAQ
          </Link>
          <Link
            href="/create"
            className="text-muted-foreground hover:text-primary"
          >
            Criar Agora
          </Link>
        </div>

        {/* Linha Separadora */}
        <Separator className="my-4" />

        {/* Créditos */}
        <div className="text-sm text-muted-foreground">
          &copy; 2024 Costimizer. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
