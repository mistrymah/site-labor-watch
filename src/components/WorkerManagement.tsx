import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Users, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  phone: string;
  dailyWage: number;
  status: "present" | "absent" | "not_marked";
}

interface WorkerManagementProps {
  workers: Worker[];
  onAddWorker: (worker: Omit<Worker, "id" | "status">) => void;
  onUpdateWorker: (workerId: string, worker: Omit<Worker, "id" | "status">) => void;
  onDeleteWorker: (workerId: string) => void;
  onBack: () => void;
}

const WorkerManagement = ({ workers, onAddWorker, onUpdateWorker, onDeleteWorker, onBack }: WorkerManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    role: "",
    phone: "",
    dailyWage: ""
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      role: "",
      phone: "",
      dailyWage: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.employeeId || !formData.role || !formData.phone || !formData.dailyWage) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const workerData = {
      name: formData.name,
      employeeId: formData.employeeId,
      role: formData.role,
      phone: formData.phone,
      dailyWage: parseInt(formData.dailyWage)
    };

    if (editingWorker) {
      onUpdateWorker(editingWorker.id, workerData);
      setEditingWorker(null);
      toast({
        title: "Success",
        description: "Worker updated successfully"
      });
    } else {
      onAddWorker(workerData);
      setIsAddDialogOpen(false);
      toast({
        title: "Success", 
        description: "Worker added successfully"
      });
    }
    
    resetForm();
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      employeeId: worker.employeeId,
      role: worker.role,
      phone: worker.phone,
      dailyWage: worker.dailyWage.toString()
    });
  };

  const handleDelete = (workerId: string) => {
    onDeleteWorker(workerId);
    toast({
      title: "Success",
      description: "Worker deleted successfully"
    });
  };

  const totalWages = workers.reduce((sum, worker) => sum + worker.dailyWage, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Attendance
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Worker Management</h1>
              <p className="text-muted-foreground">Add and manage workers</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add New Worker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Worker</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter worker's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({...prev, employeeId: e.target.value}))}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role/Position</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                    placeholder="e.g., Mason, Helper, Electrician"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="dailyWage">Daily Wage (₹)</Label>
                  <Input
                    id="dailyWage"
                    type="number"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData(prev => ({...prev, dailyWage: e.target.value}))}
                    placeholder="Enter daily wage amount"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Worker</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
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
                <div className="p-3 bg-accent/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground">Total Daily Wages</p>
                  <p className="text-2xl font-bold">₹{totalWages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-muted-foreground">Average Wage</p>
                  <p className="text-2xl font-bold">₹{workers.length > 0 ? Math.round(totalWages / workers.length) : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{worker.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>ID: {worker.employeeId}</span>
                      <span>Role: {worker.role}</span>
                      <span>Daily Wage: ₹{worker.dailyWage}</span>
                      <span>Phone: {worker.phone}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(worker)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(worker.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {workers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No workers added yet. Click "Add New Worker" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Worker</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter worker's full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-employeeId">Employee ID</Label>
                <Input
                  id="edit-employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({...prev, employeeId: e.target.value}))}
                  placeholder="Enter employee ID"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role/Position</Label>
                <Input
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                  placeholder="e.g., Mason, Helper, Electrician"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="edit-dailyWage">Daily Wage (₹)</Label>
                <Input
                  id="edit-dailyWage"
                  type="number"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData(prev => ({...prev, dailyWage: e.target.value}))}
                  placeholder="Enter daily wage amount"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Update Worker</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingWorker(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkerManagement;