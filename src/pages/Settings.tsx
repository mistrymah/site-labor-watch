import { useState } from "react";

declare global {
  interface Window {
    Capacitor: any;
  }
}
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, Upload, AlertTriangle, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const Settings = () => {
  const { workers, sites, allocations, attendance, transactions, importData } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const data = {
        workers,
        sites,
        allocations,
        attendance,
        transactions,
        exportedAt: new Date().toISOString()
      };
      
      const fileName = `contractor_backup_${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(data, null, 2);

      // Check if we are running in Capacitor (on mobile)
      const isNative = window.Capacitor?.isNativePlatform();

      if (isNative) {
        // Native: Write to filesystem and share
        try {
          const result = await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });

          await Share.share({
            title: 'Backup Data',
            text: 'Here is your backup file for Site Labor Watch.',
            url: result.uri,
            dialogTitle: 'Save Backup File',
          });
          
          toast({ title: "Backup Ready", description: "Save the file to a safe location." });
        } catch (err) {
          console.error("Native export failed", err);
          // Fallback to cache directory if documents fails (permissions)
          try {
             const result = await Filesystem.writeFile({
              path: fileName,
              data: jsonString,
              directory: Directory.Cache,
              encoding: Encoding.UTF8,
            });
            await Share.share({
              title: 'Backup Data',
              text: 'Here is your backup file for Site Labor Watch.',
              url: result.uri,
              dialogTitle: 'Save Backup File',
            });
          } catch (retryErr) {
             toast({ title: "Export Failed", description: "Could not save backup file.", variant: "destructive" });
          }
        }
      } else {
        // Web: Use standard download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Backup Downloaded", description: "File saved to downloads." });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Export Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (importData(data)) {
           toast({ title: "Restore Successful", description: "Your data has been updated." });
        } else {
           toast({ title: "Import Failed", description: "Invalid data format.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Import Failed", description: "Invalid backup file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:py-8 max-w-2xl mx-auto">
        <div className="mb-5">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">Data & Settings</h1>
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
