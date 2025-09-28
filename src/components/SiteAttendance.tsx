import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Users, Calendar } from "lucide-react";

interface Site {
  id: string;
  name: string;
  location: string;
  totalWorkers: number;
  presentToday: number;
  status: "active" | "inactive";
}

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  phone: string;
  status: "present" | "absent" | "not_marked";
  checkInTime?: string;
}

interface SiteAttendanceProps {
  site: Site;
  onBack: () => void;
}

const mockWorkers: Worker[] = [
  { id: "1", name: "Rajesh Kumar", employeeId: "EMP001", role: "Mason", phone: "+91 98765 43210", status: "present", checkInTime: "08:15 AM" },
  { id: "2", name: "Suresh Yadav", employeeId: "EMP002", role: "Helper", phone: "+91 98765 43211", status: "present", checkInTime: "08:20 AM" },
  { id: "3", name: "Amit Singh", employeeId: "EMP003", role: "Electrician", phone: "+91 98765 43212", status: "absent" },
  { id: "4", name: "Ravi Sharma", employeeId: "EMP004", role: "Plumber", phone: "+91 98765 43213", status: "present", checkInTime: "08:10 AM" },
  { id: "5", name: "Deepak Gupta", employeeId: "EMP005", role: "Helper", phone: "+91 98765 43214", status: "not_marked" },
  { id: "6", name: "Manoj Tiwari", employeeId: "EMP006", role: "Carpenter", phone: "+91 98765 43215", status: "present", checkInTime: "08:25 AM" },
  { id: "7", name: "Santosh Kumar", employeeId: "EMP007", role: "Mason", phone: "+91 98765 43216", status: "not_marked" },
  { id: "8", name: "Vinod Prasad", employeeId: "EMP008", role: "Helper", phone: "+91 98765 43217", status: "absent" },
];

const SiteAttendance = ({ site, onBack }: SiteAttendanceProps) => {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);

  const markAttendance = (workerId: string, status: "present" | "absent") => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        return {
          ...worker,
          status,
          checkInTime: status === "present" ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return worker;
    }));
  };

  const presentWorkers = workers.filter(w => w.status === "present").length;
  const absentWorkers = workers.filter(w => w.status === "absent").length;
  const notMarkedWorkers = workers.filter(w => w.status === "not_marked").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Sites
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{site.name}</h1>
            <p className="text-muted-foreground">{site.location}</p>
          </div>
        </div>

        {/* Date and Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
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
                  <p className="text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-success">{presentWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-destructive">{absentWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-muted-foreground">Not Marked</p>
                  <p className="text-2xl font-bold text-warning">{notMarkedWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Worker Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{worker.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID: {worker.employeeId}</span>
                          <span>Role: {worker.role}</span>
                          <span>Phone: {worker.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {worker.status === "present" && worker.checkInTime && (
                      <span className="text-sm text-muted-foreground">
                        Check-in: {worker.checkInTime}
                      </span>
                    )}
                    
                    <Badge 
                      variant={
                        worker.status === "present" ? "default" : 
                        worker.status === "absent" ? "destructive" : 
                        "secondary"
                      }
                      className={
                        worker.status === "present" ? "bg-success hover:bg-success-hover" :
                        worker.status === "absent" ? "" :
                        "bg-warning hover:bg-warning-hover"
                      }
                    >
                      {worker.status === "present" ? "Present" : 
                       worker.status === "absent" ? "Absent" : 
                       "Not Marked"}
                    </Badge>

                    {worker.status === "not_marked" && (
                      <div className="flex gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => markAttendance(worker.id, "present")}
                        >
                          Present
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => markAttendance(worker.id, "absent")}
                        >
                          Absent
                        </Button>
                      </div>
                    )}

                    {worker.status !== "not_marked" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setWorkers(prev => prev.map(w => 
                            w.id === worker.id ? { ...w, status: "not_marked", checkInTime: undefined } : w
                          ));
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteAttendance;