"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare, List, MapPin, Plane } from "lucide-react";

// Define the interface for document content
interface DocumentContent {
  itinerary: any;
  practicalInfo: any;
  cultureEtiquette: any;
  emergency: any;
}

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [userData, setUserData] = useState<{ data: any; documentContent: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false); // Controle do toggle
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
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
  if (!userData) return <div>No data found for this user.</div>;

  const { userName, destination, days, people, travelStyle } = userData.data;

  // Normalizar os dados
  const documentContent: DocumentContent = JSON.parse(userData.documentContent);

  // Verifique e normalize os dados após o parsing
  const itinerary = Array.isArray(documentContent.itinerary)
    ? documentContent.itinerary
    : typeof documentContent.itinerary === "string"
      ? documentContent.itinerary.split("\\n\\n").map((item) => {
        const [key, ...value] = item.split(":");
        return { [key.trim()]: value.join(":").trim() };
      })
      : [];
  const practicalInfo = Array.isArray(documentContent.practicalInfo)
    ? documentContent.practicalInfo
    : typeof documentContent.practicalInfo === "string"
      ? documentContent.practicalInfo.split("\\n\\n").map((item) => {
        const [key, ...value] = item.split(":");
        return { [key.trim()]: value.join(":").trim() };
      })
      : [];
  const cultureEtiquette = Array.isArray(documentContent.cultureEtiquette)
    ? documentContent.cultureEtiquette
    : typeof documentContent.cultureEtiquette === "string"
      ? documentContent.cultureEtiquette.split("\\n\\n").map((item) => {
        const [key, ...value] = item.split(":");
        return { [key.trim()]: value.join(":").trim() };
      })
      : [];
  const emergency = Array.isArray(documentContent.emergency)
    ? documentContent.emergency
    : typeof documentContent.emergency === "string"
      ? documentContent.emergency.split("\\n\\n").map((item) => {
        const [key, ...value] = item.split(":");
        return { [key.trim()]: value.join(":").trim() };
      })
      : [];

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Travel Dashboard for {userName}</h1>
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
              <CardTitle>Trip Overview</CardTitle>
              <CardDescription>Your journey at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-center">
                <div>
                  <Plane className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{days} Days</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{destination}</p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <List className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{people}</p>
                  <p className="text-xs text-muted-foreground">Travelers</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <CheckSquare className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{travelStyle}</p>
                  <p className="text-xs text-muted-foreground">Style</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Comprehensive Travel Guide</CardTitle>
            <CardDescription>Everything you need to know for your trip</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="practical">Practical Info</TabsTrigger>
                <TabsTrigger value="culture">Culture & Etiquette</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>
              <TabsContent value="itinerary">
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {itinerary.map((day: { [key: string]: string }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{Object.keys(day)[0]}</h3>
                      <p>{Object.values(day)[0]}</p>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="practical">
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {practicalInfo.map((info: { [key: string]: string }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{Object.keys(info)[0]}</h3>
                      <p>{Object.values(info)[0]}</p>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="culture">
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {cultureEtiquette.map((item: { [key: string]: string }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{Object.keys(item)[0]}</h3>
                      <p>{Object.values(item)[0]}</p>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="emergency">
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {emergency.map((emergencyItem: { [key: string]: string }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{Object.keys(emergencyItem)[0]}</h3>
                      <p>{Object.values(emergencyItem)[0]}</p>
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
