import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";
import SiteAttendance from "@/components/SiteAttendance";

interface Site {
  id: string;
  name: string;
  location: string;
  totalWorkers: number;
  presentToday: number;
  status: "active" | "inactive";
}

const mockSites: Site[] = [
  {
    id: "1",
    name: "Tower Construction A",
    location: "Downtown District",
    totalWorkers: 45,
    presentToday: 38,
    status: "active"
  },
  {
    id: "2", 
    name: "Highway Bridge Project",
    location: "North Highway",
    totalWorkers: 32,
    presentToday: 28,
    status: "active"
  },
  {
    id: "3",
    name: "Shopping Complex",
    location: "West Zone",
    totalWorkers: 28,
    presentToday: 24,
    status: "active"
  },
  {
    id: "4",
    name: "Residential Phase 2",
    location: "East Colony",
    totalWorkers: 18,
    presentToday: 15,
    status: "inactive"
  }
];

const Index = () => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  if (selectedSite) {
    return (
      <SiteAttendance 
        site={selectedSite} 
        onBack={() => setSelectedSite(null)} 
      />
    );
  }

  const totalWorkers = mockSites.reduce((sum, site) => sum + site.totalWorkers, 0);
  const totalPresent = mockSites.reduce((sum, site) => sum + site.presentToday, 0);
  const attendanceRate = Math.round((totalPresent / totalWorkers) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Professional construction site with workers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl font-bold mb-2">Site Attendance Manager</h1>
            <p className="text-lg opacity-90">Professional labor tracking for construction sites</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Active Sites</p>
                  <p className="text-2xl font-bold">
                    {mockSites.filter(site => site.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground">Total Workers</p>
                  <p className="text-2xl font-bold">{totalWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-bold">{totalPresent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Date */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSites.map((site) => (
            <Card key={site.id} className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{site.location}</p>
                  </div>
                  <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                    {site.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Workers</span>
                    <span className="font-medium">{site.totalWorkers}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Present Today</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-success">{site.presentToday}</span>
                      {site.presentToday < site.totalWorkers && (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(site.presentToday / site.totalWorkers) * 100}%` }}
                    />
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setSelectedSite(site)}
                    disabled={site.status === 'inactive'}
                  >
                    Manage Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;