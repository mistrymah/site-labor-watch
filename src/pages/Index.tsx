import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, CheckCircle2, Plus, ArrowRight, UserCog, Settings as SettingsIcon } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";
import SiteAttendance from "@/components/SiteAttendance";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Site } from "@/types";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { sites, addSite, workers, attendance } = useData();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteLocation, setNewSiteLocation] = useState("");
  const navigate = useNavigate();

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiteName && newSiteLocation) {
      addSite({
        name: newSiteName,
        location: newSiteLocation
      });
      setNewSiteName("");
      setNewSiteLocation("");
      setIsCreateDialogOpen(false);
    }
  };

  if (selectedSite) {
    return (
      <SiteAttendance 
        site={selectedSite} 
        onBack={() => setSelectedSite(null)} 
      />
    );
  }

  // Calculate Dash Stats
  const activeSites = sites.filter(s => s.status === 'active').length;
  const today = new Date().toISOString().split('T')[0];
  const presentToday = new Set(attendance.filter(r => r.date === today && r.status === 'present').map(r => r.workerId)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - shorter on mobile */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Professional construction site"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="absolute inset-0 flex items-center px-4">
          <div className="text-primary-foreground">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Contractor Dashboard</h1>
            <p className="text-sm sm:text-base opacity-90">Manage Sites, Workers, and Expenses</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:py-8 max-w-7xl mx-auto">
        {/* Actions Bar - stack on mobile */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Button size="sm" onClick={() => navigate("/workers")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <UserCog className="mr-1.5 h-4 w-4" />
            Workers
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
            <SettingsIcon className="mr-1.5 h-4 w-4" />
            Backup
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <Plus className="mr-1.5 h-4 w-4" />
                New Site
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Site</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSite} className="space-y-4">
                <div>
                  <Label>Site Name</Label>
                  <Input value={newSiteName} onChange={e => setNewSiteName(e.target.value)} placeholder="e.g. Tower A" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={newSiteLocation} onChange={e => setNewSiteLocation(e.target.value)} placeholder="e.g. Downtown" />
                </div>
                <Button type="submit" className="w-full">Create Site</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Stats - horizontal scroll on mobile */}
        {/* Dashboard Stats - Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sites</p>
                  <p className="text-2xl font-bold">{activeSites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg shrink-0">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Workers</p>
                  <p className="text-2xl font-bold">{workers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold">{presentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold mb-3">Your Sites</h2>
        
        {/* Sites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {sites.map((site) => (
            <Card 
              key={site.id} 
              className="cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] border-l-4 border-l-primary"
              onClick={() => setSelectedSite(site)}
            >
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{site.name}</CardTitle>
                    <p className="text-muted-foreground text-xs sm:text-sm flex items-center mt-1">
                      <Building2 className="h-3 w-3 mr-1" />
                      {site.location}
                    </p>
                  </div>
                  <Badge variant={site.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {site.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>Click to manage attendance</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sites.length === 0 && (
            <div className="col-span-full text-center py-12 bg-secondary/20 rounded-lg border-2 border-dashed">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No sites yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your first site to start tracking.</p>
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>Create Site</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
