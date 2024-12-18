"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare, List, MapPin, Plane, Info, Globe, AlertCircle } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

// Define the interface for document content
interface TravelGuide {
  itinerary: { dayTitle: string; morning: string[]; afternoon: string[]; evening: string[] }[];
  practicalInfo: { sectionTitle: string; details: string[] }[];
  cultureEtiquette: { sectionTitle: string; details: string[] }[];
  emergency: { sectionTitle: string; details: string[] }[];
}

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

interface Activity {
  id: number;
  activity: string;
  completed: boolean;
}


export default function DashboardPage({ params }: { params: { id: string } }) {
  const [travelGuide, setTravelGuide] = useState<TravelGuide | null>(null);
  const [userData, setUserData] = useState<{ userName: string; destination: string; travelStyle: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todos');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { id: 1, task: "Check passport and visa requirements", completed: false },
      { id: 2, task: "Purchase travel insurance", completed: false },
      { id: 3, task: "Make copies of important documents", completed: false },
      { id: 4, task: "Inform bank and credit card companies", completed: false },
      { id: 5, task: "Pack essential medications", completed: false },
      { id: 6, task: "Download offline maps and translation app", completed: false },
      { id: 7, task: "Learn 5 basic phrases in local language", completed: false },
      { id: 8, task: "Pack a reusable water bottle and shopping bag", completed: false },
      { id: 9, task: "Create a custom playlist for the trip", completed: false },
      { id: 10, task: "Plan a surprise activity or meal", completed: false },
    ];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activities');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { id: 1, activity: "Try a local dish you've never heard of", completed: false },
      { id: 2, activity: "Visit a local market or bazaar", completed: false },
      { id: 3, activity: "Take a cooking class featuring regional cuisine", completed: false },
      { id: 4, activity: "Attend a local festival or event", completed: false },
      { id: 5, activity: "Go on a guided tour led by a local", completed: false },
      { id: 6, activity: "Visit a museum showcasing local history or art", completed: false },
      { id: 7, activity: "Take a scenic hike or nature walk", completed: false },
      { id: 8, activity: "Learn and practice a local craft or art form", completed: false },
      { id: 9, activity: "Watch the sunrise or sunset from a scenic spot", completed: false },
      { id: 10, activity: "Make a friend with a local and learn about their life", completed: false },
    ];
  });

  const toggleTodo = (id: number) => {
    setTodos((prev: Todo[]) => {
      const newTodos = prev.map((todo: Todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      localStorage.setItem('todos', JSON.stringify(newTodos));
      return newTodos;
    });
  };

  const toggleActivity = (id: number) => {
    setActivities((prev: Activity[]) => {
      const newActivities = prev.map((activity: Activity) =>
        activity.id === id ? { ...activity, completed: !activity.completed } : activity
      );
      localStorage.setItem('activities', JSON.stringify(newActivities));
      return newActivities;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();

        setUserData({
          userName: data.data.userName,
          destination: data.data.destination,
          travelStyle: data.data.travelStyle
        });
        setTravelGuide(JSON.parse(data.documentContent));
      } catch (error) {
        console.error(error);
        router.push("/error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  if (loading) return <div>Loading...</div>;
  if (!travelGuide || !userData) return <div>No data available for this user.</div>;

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Olá, {userData.userName}!</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="guide-mode"
            checked={showGuide}
            onCheckedChange={setShowGuide}
          />
          <Label htmlFor="guide-mode">
            {showGuide ? "Show Dashboard" : "Show Guide"}
          </Label>
        </div>
      </header>

      {!showGuide ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Visão geral da viagem:</CardTitle>
              <CardDescription>Sua jornada em resumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:flex md:space-x-4 gap-4 text-center">
                <div>
                  <Plane className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">{travelGuide.itinerary.length} Dias</p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
                <div>
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium break-words">{userData.destination}</p>
                  <p className="text-xs text-muted-foreground">Destino</p>
                </div>
                <div>
                  <List className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium">{activities.filter(a => a.completed).length}/{activities.length}</p>
                  <p className="text-xs text-muted-foreground">Atividades Concluídas</p>
                </div>
                <div>
                  <CheckSquare className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium break-words">{userData.travelStyle}</p>
                  <p className="text-xs text-muted-foreground">Estilo de viagem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Tarefas</CardTitle>
                <CardDescription>Prepare-se para sua jornada</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {todo.task}
                      </label>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Desejos de Viagem</CardTitle>
                <CardDescription>Experiências emocionantes para sua jornada</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`activity-${activity.id}`}
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                      />
                      <label
                        htmlFor={`activity-${activity.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          activity.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {activity.activity}
                      </label>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="w-full">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl">Seu guia de viagem</CardTitle>
            <CardDescription className="text-sm md:text-base">Tudo o que você precisa saber sobre a sua viagem está aqui!</CardDescription>
          </CardHeader>
          <CardContent className="p-1 md:p-6"> {/* Updated padding */}
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 p-1"> {/* Updated TabsList */}
                <TabsTrigger value="itinerary" className="text-xs md:text-sm py-1 px-2">
                  <Plane className="mr-1 h-3 w-3 md:h-4 md:w-4" /> 
                  <span className="truncate">Itinerário</span>
                </TabsTrigger>
                <TabsTrigger value="practical" className="text-xs md:text-sm py-1 px-2">
                  <Info className="mr-1 h-3 w-3 md:h-4 md:w-4" /> 
                  <span className="truncate">Info Prática</span>
                </TabsTrigger>
                <TabsTrigger value="culture" className="text-xs md:text-sm py-1 px-2">
                  <Globe className="mr-1 h-3 w-3 md:h-4 md:w-4" /> 
                  <span className="truncate">Cultura</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="text-xs md:text-sm py-1 px-2">
                  <AlertCircle className="mr-1 h-3 w-3 md:h-4 md:w-4" /> 
                  <span className="truncate">Emergência</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="itinerary">
                <ScrollArea className="h-[calc(100vh-300px)] md:h-[60vh] w-full rounded-md border p-2 md:p-4">
                  {travelGuide.itinerary.map((day, index) => (
                    <div key={index}>
                      <h3 className="text-base md:text-lg font-bold mb-2 text-blue-700">{day.dayTitle}</h3>
                      <h4 className="text-sm md:text-base font-semibold text-gray-800">Manhã</h4>
                      <ul className="list-disc pl-4 md:pl-5 text-sm md:text-base">
                        {day.morning.map((activity, idx) => (
                          <li key={idx} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                      <h4 className="font-semibold text-gray-800 mt-3">Tarde</h4>
                      <ul className="list-disc pl-5 text-sm md:text-base">
                        {day.afternoon.map((activity, idx) => (
                          <li key={idx} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                      <h4 className="font-semibold text-gray-800 mt-3">Noite</h4>
                      <ul className="list-disc pl-5 text-sm md:text-base">
                        {day.evening.map((activity, idx) => (
                          <li key={idx} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="practical">
                <ScrollArea className="h-[calc(100vh-300px)] md:h-[60vh] w-full rounded-md border p-2 md:p-4">
                  {travelGuide.practicalInfo.map((info, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-bold mb-2 text-green-700">{info.sectionTitle}</h3>
                      <ul className="list-disc pl-5">
                        {info.details.map((detail, idx) => (
                          <li key={idx} className="text-gray-700">{detail}</li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="culture">
                <ScrollArea className="h-[calc(100vh-300px)] md:h-[60vh] w-full rounded-md border p-2 md:p-4">
                  {travelGuide.cultureEtiquette.map((item, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-bold mb-2 text-purple-700">{item.sectionTitle}</h3>
                      <ul className="list-disc pl-5">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="text-gray-700">{detail}</li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="emergency">
                <ScrollArea className="h-[calc(100vh-300px)] md:h-[60vh] w-full rounded-md border p-2 md:p-4">
                  {travelGuide.emergency.map((item, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-bold mb-2 text-red-700">{item.sectionTitle}</h3>
                      <ul className="list-disc pl-5">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="text-gray-700">{detail}</li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}