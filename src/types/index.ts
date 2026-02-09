export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: string;
  defaultDailyWage: number;
  profileImage?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Links a worker to a site (The "Roster")
export interface SiteAllocation {
  id: string;
  siteId: string;
  workerId: string;
  joinedAt: string;
  isActive: boolean; // If false, they are "removed" from the site but history is kept
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'half_day' | 'overtime';
  wage: number;
  overtimeWage?: number;
  createdAt: string;
}

// Financial Transaction
export interface Transaction {
  id: string;
  siteId: string;
  date: string;
  type: 'client_payment' | 'labor_payment' | 'expense';
  amount: number;
  workerId?: string; // Required if type is 'labor_payment'
  description: string;
  paymentMode: 'cash' | 'online' | 'check';
  createdAt: string;
}

export interface DataContextType {
  workers: Worker[];
  sites: Site[];
  allocations: SiteAllocation[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  
  // Worker Actions
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;

  // Site Actions
  addSite: (site: Omit<Site, 'id' | 'createdAt' | 'status'>) => void;
  updateSite: (id: string, updates: Partial<Site>) => void;
  deleteSite: (id: string) => void;

  // Roster Actions
  addToSite: (siteId: string, workerId: string) => void;
  removeFromSite: (siteId: string, workerId: string) => void;
  getSiteWorkers: (siteId: string) => Worker[]; // Returns workers currently active on this site

  // Attendance Actions
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  getSiteAttendance: (siteId: string, date: string) => AttendanceRecord[];
  getWorkerAttendance: (workerId: string) => AttendanceRecord[];

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  getSiteTransactions: (siteId: string) => Transaction[];

  // Data Management
  importData: (data: any) => boolean;
}
