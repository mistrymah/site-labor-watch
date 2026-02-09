import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, Upload, AlertTriangle, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { workers, sites, allocations, attendance, transactions, importData } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    const data = {
      workers,
      sites,
      allocations,
      attendance,
      transactions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contractor_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Backup Downloaded", description: "Keep this file safe!" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        importData(data);
        toast({ title: "Restore Successful", description: "Your data has been updated." });
      } catch (error) {
        toast({ title: "Import Failed", description: "Invalid backup file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Data & Settings</h1>
        </div>

        <div className="space-y-6">
          <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Download className="h-5 w-5" />
                 Backup Data
               </CardTitle>
               <CardDescription>
                 Download a copy of all your workers, sites, and attendance records.
                 Save this file securely.
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Button onClick={handleExport} className="w-full">
                 Download Backup
               </Button>
             </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Upload className="h-5 w-5" />
                 Restore Data
               </CardTitle>
               <CardDescription>
                 Restore your data from a previous backup file.
                 <div className="flex items-center gap-2 text-warning mt-2 text-xs font-bold">
                   <AlertTriangle className="h-3 w-3" />
                   Warning: This will overwrite your current app data.
                 </div>
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="relative">
                 <Button variant="outline" className="w-full">
                   Select Backup File
                 </Button>
                 <input 
                   type="file" 
                   accept=".json" 
                   onChange={handleImport}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
               </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Database className="h-5 w-5" />
                 Storage Info
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 text-sm text-muted-foreground">
               <p><strong>Workers:</strong> {workers.length}</p>
               <p><strong>Sites:</strong> {sites.length}</p>
               <p><strong>Attendance Records:</strong> {attendance.length}</p>
               <p><strong>Transactions:</strong> {transactions.length}</p>
               <p className="pt-2 italic">Data is saved locally on this device.</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
