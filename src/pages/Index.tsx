import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, CheckCircle2, Plus, ArrowRight, UserCog, Settings as SettingsIcon } from "lucide-react";
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
  // Get unique workers who are present today across ALL sites
  const today = new Date().toISOString().split('T')[0];
  const presentToday = new Set(attendance.filter(r => r.date === today && r.status === 'present').map(r => r.workerId)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Professional construction site"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <h1 className="text-4xl font-bold mb-2">Contractor Dashboard</h1>
            <p className="text-lg opacity-90">Manage Sites, Workers, and Expenses</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
           <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate("/workers")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <UserCog className="mr-2 h-5 w-5" />
                Manage Workers
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/settings")}>
                <SettingsIcon className="mr-2 h-5 w-5" />
                Backup / Data
              </Button>
           </div>
           
           <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
             <DialogTrigger asChild>
               <Button size="lg">
                 <Plus className="mr-2 h-5 w-5" />
                 Create New Site
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

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Active Sites</p>
                  <p className="text-2xl font-bold">{activeSites}</p>
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
                  <p className="text-2xl font-bold">{workers.length}</p>
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
                  <p className="text-muted-foreground">Present Today (All Sites)</p>
                  <p className="text-2xl font-bold">{presentToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Your Sites</h2>
        
        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card 
              key={site.id} 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-primary"
              onClick={() => setSelectedSite(site)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{site.name}</CardTitle>
                    <p className="text-muted-foreground text-sm flex items-center mt-1">
                      <Building2 className="h-3 w-3 mr-1" />
                      {site.location}
                    </p>
                  </div>
                  <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                    {site.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
                  <span>Click to manage attendance</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sites.length === 0 && (
            <div className="col-span-full text-center py-16 bg-secondary/20 rounded-lg border-2 border-dashed">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium">No sites yet</h3>
              <p className="text-muted-foreground mb-6">Create your first site to start tracking work.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create Site</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
