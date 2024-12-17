"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plane, Users, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Esquema de validação Zod
const formSchema = z.object({
  userName: z.string().min(2, { message: "Insira ao menos 2 caracteres." }),
  userEmail: z.string().email({ message: "Insira um e-mail válido." }),
  destination: z.string().min(2, { message: "Escolha um destino válido." }),
  days: z
    .string()
    .regex(/^\d+$/, "Insira um número positivo.")
    .refine((value) => parseInt(value) <= 30, {
      message: "O máximo permitido são 30 dias.",
    }),
  people: z.string().regex(/^\d+$/, "Insira um número positivo."),
  travelStyle: z.string({
    required_error: "Escolha um estilo de viagem.",
  }),
  includeTransport: z.string().min(1, { message: "Escolha uma opção de transporte." }),
  includeMeals: z.string().optional(),
});

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includeTransport: "",
      includeMeals: "",
    },
  });

  // Busca dinâmica para sugestões de destino
  const fetchDestinations = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&featuretype=city&addressdetails=1`
      );
      const data = await response.json();
      // Filtra apenas cidades ou locais válidos
      const filteredData = data.filter((item: any) => item.type === "city" || item.type === "administrative");
      setSuggestions(filteredData);
    } catch (error) {
      console.error("Erro ao buscar destinos:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error("Erro ao gerar o pagamento:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 bg-gray-900">
      {/* Camada de Blur com ajuste */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/50 to-transparent blur-[120px]"></div>

      {/* Formulário Central */}
      <Card className="relative w-full max-w-3xl shadow-2xl z-10 bg-card border border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold text-white">
            Planeje Sua Viagem
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Preencha os detalhes abaixo para gerar uma estimativa dos custos da sua viagem.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-white">Informações Pessoais</h3>
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Ex.: joao@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Detalhes da Viagem */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-white">Detalhes da Viagem</h3>
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* Input com estilo dinâmico para modo claro/escuro */}
                            <Input
                              placeholder="Digite o destino (ex.: Paris)"
                              value={inputValue}
                              className="bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                              onChange={(e) => {
                                const value = e.target.value;
                                setInputValue(value);
                                fetchDestinations(value);
                                field.onChange(value);
                              }}
                            />
                            {/* Sugestões */}
                            {suggestions.length > 0 && (
                              <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto z-50">
                                {suggestions.map((item, index) => (
                                  <li
                                    key={index}
                                    className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white"
                                    onClick={() => {
                                      field.onChange(item.display_name);
                                      setInputValue(item.display_name);
                                      setSuggestions([]);
                                    }}
                                  >
                                    {item.display_name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Dias</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex.: 7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="people"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Pessoas</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex.: 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Preferências */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-white">Preferências</h3>
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Estilo da Viagem */}
                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo da Viagem</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um estilo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Econômico</SelectItem>
                            <SelectItem value="comfort">Conforto</SelectItem>
                            <SelectItem value="luxury">Luxo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Transporte Preferido */}
                  <FormField
                    control={form.control}
                    name="includeTransport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transporte Preferido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Taxi">Táxi</SelectItem>
                            <SelectItem value="Public Transport">Transporte Público</SelectItem>
                            <SelectItem value="Car Rental">Aluguel de Carro</SelectItem>
                            <SelectItem value="Walking">A Pé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Tipo de Refeições */}
                  <FormField
                    control={form.control}
                    name="includeMeals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferência de Refeições</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma opção de refeição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="street_food">Comida de Rua</SelectItem>
                            <SelectItem value="restaurants">Restaurantes</SelectItem>
                            <SelectItem value="buffet">Buffet</SelectItem>
                            <SelectItem value="local_cuisine">Culinária Local</SelectItem>
                            <SelectItem value="none">Não Incluir</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? "Gerando..." : "Gerar meu guia"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}