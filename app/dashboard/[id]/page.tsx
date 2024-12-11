"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CheckSquare, Download, List, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data dynamically from the backend
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error(error);
        router.push("/error"); // Redirect to an error page if needed
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>No data found for this user.</div>;

  const { userName, destination, days, people, travelStyle, includeTransport, transportType, includeMeals, documentUrl } = userData.data;

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Travel Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Documents to Download</DialogTitle>
              <DialogDescription>
                Click on a document to download it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Travel Guide</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(documentUrl, "_blank")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Trip Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trip Overview of {userName}</CardTitle>
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
              <p className="text-sm font-medium">{travelStyle}</p>
              <p className="text-xs text-muted-foreground">Style</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travel Script */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Script</CardTitle>
            <CardDescription>Your personalized travel narrative</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <p>{userData.data.documentContent}</p>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>What you selected</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>
                <strong>Include Transport:</strong> {includeTransport ? `Yes (${transportType})` : "No"}
              </li>
              <li>
                <strong>Include Meals:</strong> {includeMeals ? "Yes" : "No"}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
