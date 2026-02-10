import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, XCircle, Calendar as CalendarIcon, UserPlus, Trash2, IndianRupee, FileText, Download, TrendingUp, TrendingDown, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Site, Worker, Transaction } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SiteAttendanceProps {
  site: Site;
  onBack: () => void;
}

const SiteAttendance = ({ site, onBack }: SiteAttendanceProps) => {
  const { 
    workers: allWorkers, 
    getSiteWorkers, 
    addToSite, 
    removeFromSite, 
    markAttendance, 
    getSiteAttendance, 
    attendance,
    transactions, 
    addTransaction,
    getSiteTransactions
  } = useData();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Transaction State
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'client_payment' | 'labor_payment' | 'expense'>('client_payment');
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDesc, setTransactionDesc] = useState("");
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");

  // Get active roster for this site
  const activeSiteWorkers = getSiteWorkers(site.id);

  // Get attendance for selected date
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dailyAttendance = getSiteAttendance(site.id, dateStr);

  // LOGIC FIX: Show workers who are active OR have attendance on this day (even if removed later)
  const workerIdsWithAttendance = dailyAttendance.map(r => r.workerId);
  const displayWorkers = allWorkers.filter(w => 
    activeSiteWorkers.some(aw => aw.id === w.id) || workerIdsWithAttendance.includes(w.id)
  );

  const handleMarkAttendance = (worker: Worker, status: 'present' | 'absent' | 'half_day') => {
    let wage = 0;
    if (status === 'present') wage = worker.defaultDailyWage;
    if (status === 'half_day') wage = worker.defaultDailyWage / 2;
    // Absent wage = 0

    markAttendance({
      workerId: worker.id,
      siteId: site.id,
      date: dateStr,
      status,
      wage
    });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionAmount || !transactionDesc) return;

    addTransaction({
      siteId: site.id,
      date: format(transactionDate, "yyyy-MM-dd"),
      type: transactionType,
      amount: parseFloat(transactionAmount),
      description: transactionDesc,
      paymentMode: 'cash', // Default to cash for now
      workerId: transactionType === 'labor_payment' ? selectedWorkerId : undefined
    });

    setIsAddTransactionOpen(false);
    setTransactionAmount("");
    setTransactionDesc("");
    setTransactionDate(new Date());
    setSelectedWorkerId("");
  };

  // Stats for the day
  const presentCount = dailyAttendance.filter(r => r.status === 'present').length;
  const absentCount = dailyAttendance.filter(r => r.status === 'absent').length;
  const totalDailyCost = dailyAttendance.reduce((sum, r) => sum + r.wage, 0);

  // Filter master list for "Add Worker" dialog
  // Exclude workers already displayed
  const availableWorkers = allWorkers.filter(
    w => !displayWorkers.find(dw => dw.id === w.id) && 
    (w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Financial Stats
  const siteTransactions = getSiteTransactions(site.id);
  const totalClientReceived = siteTransactions.filter(t => t.type === 'client_payment').reduce((sum, t) => sum + t.amount, 0);
  const totalLaborPaid = siteTransactions.filter(t => t.type === 'labor_payment').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = siteTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalClientReceived - totalLaborPaid - totalExpenses;

  // Report Calculations
  const siteTotalAttendance = attendance.filter(r => r.siteId === site.id);
  const siteTotalCost = siteTotalAttendance.reduce((sum, r) => sum + r.wage, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-1">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">{site.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{site.location}</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Report</TabsTrigger>
          </TabsList>

          {/* ATTENDANCE TAB */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
               <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                 <ChevronLeft className="h-5 w-5" />
               </Button>
               
               <div className="flex items-center gap-2">
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="font-semibold text-lg hover:bg-transparent">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {format(selectedDate, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
               </div>

               <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                 <ChevronRight className="h-5 w-5" />
               </Button>
            </div>

            <div className="flex justify-end">
               <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Labor to Site
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Worker from Master List</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input 
                      placeholder="Search workers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="h-[300px] overflow-y-auto space-y-2">
                      {availableWorkers.map(worker => (
                        <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                          <div>
                            <p className="font-medium">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">{worker.role} • ₹{worker.defaultDailyWage}/day</p>
                          </div>
                          <Button size="sm" onClick={() => {
                            addToSite(site.id, worker.id);
                            setIsAddWorkerOpen(false);
                          }}>
                            Add
                          </Button>
                        </div>
                      ))}
                      {availableWorkers.length === 0 && (
                         <div className="text-center py-4">
                           <p className="text-muted-foreground mb-2">No active available workers found.</p>
                           <p className="text-xs text-muted-foreground">Go to "Manage Master Workers" on home page to add more people.</p>
                         </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Daily Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-2.5 sm:p-4 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                  <div className="p-1.5 bg-green-100 rounded-full text-green-600"><CheckCircle2 className="h-4 w-4" /></div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Present</p>
                    <p className="font-bold text-base sm:text-lg">{presentCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2.5 sm:p-4 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                  <div className="p-1.5 bg-red-100 rounded-full text-red-600"><XCircle className="h-4 w-4" /></div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Absent</p>
                    <p className="font-bold text-base sm:text-lg">{absentCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2.5 sm:p-4 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><IndianRupee className="h-4 w-4" /></div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Cost</p>
                    <p className="font-bold text-base sm:text-lg">₹{totalDailyCost}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Matrix */}
            <div className="grid gap-3">
              {displayWorkers.map(worker => {
                const record = dailyAttendance.find(r => r.workerId === worker.id);
                const status = record?.status || 'not_marked';
                const isRemovedFromRoster = !activeSiteWorkers.find(aw => aw.id === worker.id);

                return (
                  <Card key={worker.id} className={cn("overflow-hidden", isRemovedFromRoster && "opacity-75 border-dashed")}>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {worker.name.charAt(0)}
                          </div>
                          {isRemovedFromRoster && (
                             <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" title="Removed from roster" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                             {worker.name}
                             {isRemovedFromRoster && <span className="text-[10px] bg-secondary px-1 rounded text-muted-foreground">(History)</span>}
                          </h3>
                          <p className="text-xs text-muted-foreground">{worker.role} • ₹{worker.defaultDailyWage}/day</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex bg-secondary p-1 rounded-lg">
                          <Button 
                            variant={status === 'present' ? 'default' : 'ghost'} 
                            size="sm" 
                            className={cn("h-8 px-3", status === 'present' && "bg-success hover:bg-success/90")}
                            onClick={() => handleMarkAttendance(worker, 'present')}
                          >
                            P
                          </Button>
                          <Button 
                            variant={status === 'half_day' ? 'default' : 'ghost'} 
                            size="sm" 
                            className={cn("h-8 px-3", status === 'half_day' && "bg-warning hover:bg-warning/90")}
                            onClick={() => handleMarkAttendance(worker, 'half_day')}
                          >
                            HD
                          </Button>
                          <Button 
                            variant={status === 'absent' ? 'default' : 'ghost'} 
                            size="sm" 
                            className={cn("h-8 px-3", status === 'absent' && "bg-destructive hover:bg-destructive/90")}
                            onClick={() => handleMarkAttendance(worker, 'absent')}
                          >
                            A
                          </Button>
                        </div>

                        {!isRemovedFromRoster ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56">
                              <p className="text-sm font-medium mb-1">Remove from this Site?</p>
                              <p className="text-xs text-muted-foreground mb-3">Does not delete attendance history.</p>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full"
                                onClick={() => removeFromSite(site.id, worker.id)}
                              >
                                Confirm Remove
                              </Button>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {displayWorkers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">No workers assigned to this site yet.</p>
                  <Button variant="link" onClick={() => setIsAddWorkerOpen(true)}>Add Labor Now</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments" className="space-y-6">
            {/* Same as before... */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                   <p className="text-sm text-muted-foreground">Client Received</p>
                   <p className="text-2xl font-bold text-success">₹{totalClientReceived}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                   <p className="text-sm text-muted-foreground">Labor Paid</p>
                   <p className="text-2xl font-bold text-destructive">₹{totalLaborPaid}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                   <p className="text-sm text-muted-foreground">Site Balance</p>
                   <p className={cn("text-2xl font-bold", balance >= 0 ? "text-primary" : "text-destructive")}>
                     ₹{balance}
                   </p>
                </CardContent>
              </Card>
              <div className="flex items-center justify-end">
                <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full md:w-auto">
                       <Plus className="mr-2 h-4 w-4" />
                       Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                       <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTransaction} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <Select value={transactionType} onValueChange={(v: any) => setTransactionType(v)}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="client_payment">Client Payment (Received)</SelectItem>
                             <SelectItem value="labor_payment">Labor Payment (Paid)</SelectItem>
                             <SelectItem value="expense">Other Expense (Paid)</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>

                      {transactionType === 'labor_payment' && (
                        <div className="space-y-2">
                          <Label>Select Worker</Label>
                          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose worker" />
                            </SelectTrigger>
                            <SelectContent>
                              {allWorkers.map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                         <Label>Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(transactionDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                               <Calendar mode="single" selected={transactionDate} onSelect={(d) => d && setTransactionDate(d)} initialFocus />
                            </PopoverContent>
                         </Popover>
                      </div>

                      <div className="space-y-2">
                         <Label>Amount (₹)</Label>
                         <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                         />
                      </div>

                      <div className="space-y-2">
                         <Label>Description</Label>
                         <Textarea 
                            placeholder="e.g. Advance payment, Material purchase, etc."
                            value={transactionDesc}
                            onChange={(e) => setTransactionDesc(e.target.value)}
                         />
                      </div>

                      <Button type="submit" className="w-full">Save Transaction</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

             <Card>
               <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {siteTransactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No transactions recorded yet.</p>
                     ) : (
                        siteTransactions.slice().reverse().map(t => (
                           <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/5">
                              <div className="flex items-start gap-3">
                                 <div className={cn("p-2 rounded-full", 
                                    t.type === 'client_payment' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                 )}>
                                    {t.type === 'client_payment' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                 </div>
                                 <div>
                                    <p className="font-medium">
                                       {t.type === 'client_payment' ? "Client Payment" : 
                                        t.type === 'labor_payment' ? `Paid to ${allWorkers.find(w => w.id === t.workerId)?.name || 'Worker'}` : 
                                        "Expense"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</p>
                                 </div>
                              </div>
                              <span className={cn("font-bold", 
                                 t.type === 'client_payment' ? "text-success" : "text-destructive"
                              )}>
                                 {t.type === 'client_payment' ? "+" : "-"} ₹{t.amount}
                              </span>
                           </div>
                        ))
                     )}
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Total Labor Cost (Attn)</span>
                      <span className="font-bold text-xl">₹{siteTotalCost}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Actual Labor Paid</span>
                      <span className="font-bold text-xl text-destructive">₹{totalLaborPaid}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Pending Labor Dues</span>
                       <span className={cn("font-bold text-xl", siteTotalCost - totalLaborPaid > 0 ? "text-warning" : "text-success")}>
                          ₹{siteTotalCost - totalLaborPaid}
                       </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                     <CardTitle>Worker Wise Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="max-h-[300px] overflow-y-auto space-y-3">
                        {displayWorkers.map(worker => {
                           const workerRecords = siteTotalAttendance.filter(r => r.workerId === worker.id);
                           const totalEarned = workerRecords.reduce((sum, r) => sum + r.wage, 0);
                           const daysWorked = workerRecords.filter(r => r.status === 'present' || r.status === 'half_day').length;
                           
                           // Calculate how much collected
                           const paidToWorker = siteTransactions
                              .filter(t => t.type === 'labor_payment' && t.workerId === worker.id)
                              .reduce((sum, t) => sum + t.amount, 0);

                           if(daysWorked === 0) return null;

                           return (
                             <div key={worker.id} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                                <div>
                                   <p className="font-medium text-sm">{worker.name}</p>
                                   <p className="text-xs text-muted-foreground">{daysWorked} days</p>
                                </div>
                                <div className="text-right">
                                   <p className="font-bold text-sm">Earned: ₹{totalEarned}</p>
                                   <p className={cn("text-xs font-medium", totalEarned - paidToWorker > 0 ? "text-destructive" : "text-success")}>
                                      Due: ₹{totalEarned - paidToWorker}
                                   </p>
                                </div>
                             </div>
                           );
                        })}
                        {displayWorkers.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                     </div>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteAttendance;
