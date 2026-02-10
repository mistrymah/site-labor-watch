import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Phone, IndianRupee, ArrowLeft } from "lucide-react";
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
    setFormData({ name: "", role: "", phone: "", defaultDailyWage: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.defaultDailyWage) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
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
      toast({ title: "Success", description: "Worker updated" });
    } else {
      addWorker(workerData);
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Worker added" });
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
    if (window.confirm("Remove this worker from master list?")) {
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
      <div className="px-4 py-5 sm:py-8 max-w-6xl mx-auto">
        {/* Header - stacked on mobile */}
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Master Worker List</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Total: {workers.length} workers</p>
          </div>
          
          <Dialog open={isAddDialogOpen || !!editingWorker} onOpenChange={(open) => {
            if (!open) { setIsAddDialogOpen(false); setEditingWorker(null); resetForm(); }
            else { setIsAddDialogOpen(true); }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Worker
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
        <div className="mb-4">
          <Input 
            placeholder="Search by name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 sm:space-y-0">
          {filteredWorkers.map(worker => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {worker.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{worker.name}</h3>
                      <p className="text-xs text-muted-foreground">{worker.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(worker)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(worker.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {worker.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-0.5 font-medium">
                    <IndianRupee className="h-3 w-3" />
                    {worker.defaultDailyWage}/day
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredWorkers.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
              No workers found. Add some to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workers;
