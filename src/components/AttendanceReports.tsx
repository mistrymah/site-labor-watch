import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, BarChart3, IndianRupee, Users, Download } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  phone: string;
  dailyWage: number;
  status: "present" | "absent" | "not_marked";
}

interface AttendanceReportsProps {
  workers: Worker[];
  siteName: string;
  onBack: () => void;
}

// Mock attendance data for different dates
const mockAttendanceHistory = {
  "2024-01-15": { presentCount: 8, absentCount: 0, totalWages: 5500 },
  "2024-01-14": { presentCount: 7, absentCount: 1, totalWages: 4800 },
  "2024-01-13": { presentCount: 8, absentCount: 0, totalWages: 5500 },
  "2024-01-12": { presentCount: 6, absentCount: 2, totalWages: 4100 },
  "2024-01-11": { presentCount: 8, absentCount: 0, totalWages: 5500 },
  "2024-01-10": { presentCount: 7, absentCount: 1, totalWages: 4800 },
  "2024-01-09": { presentCount: 8, absentCount: 0, totalWages: 5500 },
};

const AttendanceReports = ({ workers, siteName, onBack }: AttendanceReportsProps) => {
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: startOfMonth(new Date()),
    to: new Date()
  });
  const [reportType, setReportType] = useState<"daily" | "summary">("summary");

  // Calculate totals from mock data
  const totalDays = Object.keys(mockAttendanceHistory).length;
  const totalWagesSpent = Object.values(mockAttendanceHistory).reduce((sum, day) => sum + day.totalWages, 0);
  const averageDailyCost = totalDays > 0 ? Math.round(totalWagesSpent / totalDays) : 0;
  const totalPresent = Object.values(mockAttendanceHistory).reduce((sum, day) => sum + day.presentCount, 0);
  const totalAbsent = Object.values(mockAttendanceHistory).reduce((sum, day) => sum + day.absentCount, 0);
  const attendanceRate = totalPresent + totalAbsent > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

  // Worker-wise summary
  const workerSummary = workers.map(worker => {
    const presentDays = Math.floor(Math.random() * 6) + 3; // Mock: 3-8 present days
    const totalEarnings = presentDays * worker.dailyWage;
    const attendancePercentage = Math.round((presentDays / totalDays) * 100);
    
    return {
      ...worker,
      presentDays,
      totalEarnings,
      attendancePercentage
    };
  });

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
              <h1 className="text-3xl font-bold">Attendance Reports</h1>
              <p className="text-muted-foreground">{siteName}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={reportType === "summary" ? "default" : "outline"}
              onClick={() => setReportType("summary")}
            >
              <BarChart3 className="h-4 w-4" />
              Summary
            </Button>
            <Button 
              variant={reportType === "daily" ? "default" : "outline"}
              onClick={() => setReportType("daily")}
            >
              <CalendarIcon className="h-4 w-4" />
              Daily Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({...prev, from: date}))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({...prev, to: date}))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Working Days</p>
                  <p className="text-2xl font-bold">{totalDays}</p>
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
                  <p className="text-muted-foreground">Total Wages</p>
                  <p className="text-2xl font-bold">₹{totalWagesSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Daily Cost</p>
                  <p className="text-2xl font-bold">₹{averageDailyCost}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {reportType === "summary" ? (
          /* Worker Summary Report */
          <Card>
            <CardHeader>
              <CardTitle>Worker-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerSummary.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{worker.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {worker.employeeId}</span>
                        <span>Role: {worker.role}</span>
                        <span>Daily Wage: ₹{worker.dailyWage}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Present Days</p>
                        <p className="font-bold text-success">{worker.presentDays}/{totalDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="font-bold text-accent">₹{worker.totalEarnings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Attendance</p>
                        <Badge 
                          variant={worker.attendancePercentage >= 80 ? "default" : 
                                 worker.attendancePercentage >= 60 ? "secondary" : "destructive"}
                          className={worker.attendancePercentage >= 80 ? "bg-success hover:bg-success-hover" : ""}
                        >
                          {worker.attendancePercentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Daily Report */
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance & Cost Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockAttendanceHistory).reverse().map(([date, data]) => (
                  <div key={date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {format(new Date(date), "EEEE, MMMM do, yyyy")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(date), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Present</p>
                        <p className="font-bold text-success">{data.presentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Absent</p>
                        <p className="font-bold text-destructive">{data.absentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Daily Cost</p>
                        <p className="font-bold text-accent">₹{data.totalWages}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Attendance Rate</p>
                        <Badge 
                          variant={data.presentCount >= 7 ? "default" : data.presentCount >= 5 ? "secondary" : "destructive"}
                          className={data.presentCount >= 7 ? "bg-success hover:bg-success-hover" : ""}
                        >
                          {Math.round((data.presentCount / (data.presentCount + data.absentCount)) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendanceReports;