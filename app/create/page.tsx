"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plane, Users, Calendar } from 'lucide-react';
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
    .refine((value) => parseInt(value) <= 25, {
      message: "O máximo permitido por enquanto são 25 dias.",
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includeTransport: "",
      includeMeals: "",
    },
  });

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
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 opacity-75"></div>

      {/* Formulário Central */}
      <Card className="relative w-full max-w-4xl shadow-2xl z-10 bg-gray-800/90 border border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold text-white">
            Planeje Sua Viagem
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Preencha os detalhes abaixo para gerar uma estimativa dos custos da sua viagem.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Users className="mr-2" /> Informações Pessoais
                </h3>
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: João Silva" {...field} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out" />
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
                          <Input type="email" placeholder="Ex.: joao@email.com" {...field} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Detalhes da Viagem */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Plane className="mr-2" /> Detalhes da Viagem
                </h3>
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: País, Cidade" {...field} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out" />
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
                          <Input type="number" placeholder="Ex.: 7" {...field} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out" />
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
                          <Input type="number" placeholder="Ex.: 2" {...field} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Preferências */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Calendar className="mr-2" /> Preferências
                </h3>
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
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out">
                            <SelectValue placeholder="Escolha um estilo" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="Econômico">Econômico</SelectItem>
                            <SelectItem value="Conforto">Conforto</SelectItem>
                            <SelectItem value="Luxo">Luxo</SelectItem>
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
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out">
                            <SelectValue placeholder="Escolha uma opção" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </div>
            ) : (
              "Gerar meu guia"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}