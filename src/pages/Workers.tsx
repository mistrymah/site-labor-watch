import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Phone, IndianRupee, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Worker } from "@/types";

const Workers = () => {
  const { workers, addWorker, updateWorker, deleteWorker } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    defaultDailyWage: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      phone: "",
      defaultDailyWage: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.defaultDailyWage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const workerData = {
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      defaultDailyWage: parseInt(formData.defaultDailyWage)
    };

    if (editingWorker) {
      updateWorker(editingWorker.id, workerData);
      setEditingWorker(null);
      toast({ title: "Success", description: "Worker updated successfully" });
    } else {
      addWorker(workerData);
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Worker added to master list" });
    }
    resetForm();
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      defaultDailyWage: worker.defaultDailyWage.toString()
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure? This will remove the worker from the master list.")) {
      deleteWorker(id);
      toast({ title: "Deleted", description: "Worker removed" });
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Master Worker List</h1>
              <p className="text-muted-foreground">Manage your entire labor pool here (Total: {workers.length})</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen || !!editingWorker} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingWorker(null);
              resetForm();
            } else {
              setIsAddDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Worker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWorker ? "Edit Worker" : "Add New Worker"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Worker Name" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Mason, Helper" />
                </div>
                <div>
                  <Label>Phone (Optional)</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" />
                </div>
                <div>
                  <Label>Default Daily Wage (₹)</Label>
                  <Input type="number" value={formData.defaultDailyWage} onChange={e => setFormData({...formData, defaultDailyWage: e.target.value})} placeholder="800" />
                </div>
                <Button type="submit" className="w-full">{editingWorker ? "Update" : "Add Worker"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input 
            placeholder="Search workers by name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(worker => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(worker.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {worker.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <IndianRupee className="h-3 w-3" />
                    {worker.defaultDailyWage}/day
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredWorkers.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No workers found. Add some to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workers;
