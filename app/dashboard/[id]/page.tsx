"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare, List, MapPin, Plane, Info, Globe, AlertCircle } from "lucide-react";

// Define the interface for document content
interface TravelGuide {
  itinerary: { dayTitle: string; morning: string[]; afternoon: string[]; evening: string[] }[];
  practicalInfo: { sectionTitle: string; details: string[] }[];
  cultureEtiquette: { sectionTitle: string; details: string[] }[];
  emergency: { sectionTitle: string; details: string[] }[];
}


export default function DashboardPage({ params }: { params: { id: string } }) {
  const [travelGuide, setTravelGuide] = useState<TravelGuide | null>(null);
  const [userData, setUserData] = useState<{ userName: string; destination: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();

        setUserData({ userName: data.data.userName, destination: data.data.destination });
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
        <h1 className="text-3xl font-bold">Travel Dashboard for {userData.userName}</h1>
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trip Overview</CardTitle>
            <CardDescription>Your journey at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 text-center">
              <div>
                <Plane className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">{travelGuide.itinerary.length} Days</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">{userData.destination}</p>
                <p className="text-xs text-muted-foreground">Destination</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <CheckSquare className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium">Comfort</p>
                <p className="text-xs text-muted-foreground">Style</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Comprehensive Travel Guide</CardTitle>
            <CardDescription>Everything you need to know for your trip</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="itinerary">
                  <Plane className="mr-2 h-4 w-4" /> Itinerary
                </TabsTrigger>
                <TabsTrigger value="practical">
                  <Info className="mr-2 h-4 w-4" /> Practical Info
                </TabsTrigger>
                <TabsTrigger value="culture">
                  <Globe className="mr-2 h-4 w-4" /> Culture & Etiquette
                </TabsTrigger>
                <TabsTrigger value="emergency">
                  <AlertCircle className="mr-2 h-4 w-4" /> Emergency
                </TabsTrigger>
              </TabsList>
              <TabsContent value="itinerary">
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {travelGuide.itinerary.map((day, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-bold mb-2 text-blue-700">{day.dayTitle}</h3>
                      <h4 className="font-semibold text-gray-800">Morning</h4>
                      <ul className="list-disc pl-5">
                        {day.morning.map((activity, idx) => (
                          <li key={idx} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                      <h4 className="font-semibold text-gray-800 mt-3">Afternoon</h4>
                      <ul className="list-disc pl-5">
                        {day.afternoon.map((activity, idx) => (
                          <li key={idx} className="text-gray-700">{activity}</li>
                        ))}
                      </ul>
                      <h4 className="font-semibold text-gray-800 mt-3">Evening</h4>
                      <ul className="list-disc pl-5">
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
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
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
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
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
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
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
