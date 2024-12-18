import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { PricingSection } from "@/components/layout/sections/pricing";

export const metadata = {
  title: "Costimizer - Seu Guia Completo de Viagens Personalizadas",
  description:
    "Planeje sua viagem de forma simples e eficiente com o Costimizer. Crie roteiros personalizados, calcule custos e aproveite dicas valiosas para tornar sua viagem perfeita.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <CommunitySection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}
