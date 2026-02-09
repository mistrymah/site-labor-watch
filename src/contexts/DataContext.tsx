import React, { createContext, useContext, useState, useEffect } from 'react';
import { Worker, Site, SiteAllocation, AttendanceRecord, Transaction, DataContextType } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('workers');
    return saved ? JSON.parse(saved) : [];
  });

  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem('sites');
    return saved ? JSON.parse(saved) : [];
  });

  const [allocations, setAllocations] = useState<SiteAllocation[]>(() => {
    const saved = localStorage.getItem('allocations');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('sites', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);

  // Worker Actions
  const addWorker = (workerData: Omit<Worker, 'id' | 'createdAt'>) => {
    const newWorker: Worker = { ...workerData, id: generateId(), createdAt: new Date().toISOString() };
    setWorkers((prev) => [...prev, newWorker]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const deleteWorker = (id: string) => {
    // Ideally check for dependencies before deleting
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  // Site Actions
  const addSite = (siteData: Omit<Site, 'id' | 'createdAt' | 'status'>) => {
    const newSite: Site = { ...siteData, id: generateId(), status: 'active', createdAt: new Date().toISOString() };
    setSites((prev) => [...prev, newSite]);
  };

  const updateSite = (id: string, updates: Partial<Site>) => {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  // Roster Actions
  const addToSite = (siteId: string, workerId: string) => {
    setAllocations(prev => {
      // Check if already exists (even if inactive)
      const existing = prev.find(a => a.siteId === siteId && a.workerId === workerId);
      if (existing) {
        // Reactivate
        return prev.map(a => a.id === existing.id ? { ...a, isActive: true } : a);
      }
      return [...prev, {
        id: generateId(),
        siteId,
        workerId,
        joinedAt: new Date().toISOString(),
        isActive: true
      }];
    });
  };

  const removeFromSite = (siteId: string, workerId: string) => {
    setAllocations(prev => prev.map(a => 
      (a.siteId === siteId && a.workerId === workerId) ? { ...a, isActive: false } : a
    ));
  };

  const getSiteWorkers = (siteId: string) => {
    const activeAllocations = allocations.filter(a => a.siteId === siteId && a.isActive);
    const workerIds = activeAllocations.map(a => a.workerId);
    return workers.filter(w => workerIds.includes(w.id));
  };

  // Attendance Actions
  const markAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    setAttendance((prev) => {
      // Remove existing record for same worker, site, and date
      const filtered = prev.filter(
        (r) => !(r.workerId === recordData.workerId && r.siteId === recordData.siteId && r.date === recordData.date)
      );
      
      const newRecord: AttendanceRecord = {
        ...recordData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      
      return [...filtered, newRecord];
    });
  };

  const getSiteAttendance = (siteId: string, date: string) => {
    return attendance.filter((r) => r.siteId === siteId && r.date === date);
  };

  const getWorkerAttendance = (workerId: string) => {
    return attendance.filter((r) => r.workerId === workerId);
  };

  // Transaction Actions
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const getSiteTransactions = (siteId: string) => {
    return transactions.filter((t) => t.siteId === siteId);
  };

  const importData = (data: any) => {
    try {
      if (data.workers) setWorkers(data.workers);
      if (data.sites) setSites(data.sites);
      if (data.allocations) setAllocations(data.allocations);
      if (data.attendance) setAttendance(data.attendance);
      if (data.transactions) setTransactions(data.transactions);
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        workers,
        sites,
        allocations,
        attendance,
        transactions,
        addWorker,
        updateWorker,
        deleteWorker,
        addSite,
        updateSite,
        deleteSite,
        addToSite,
        removeFromSite,
        getSiteWorkers,
        markAttendance,
        getSiteAttendance,
        getWorkerAttendance,
        addTransaction,
        getSiteTransactions,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) { throw new Error('useData must be used within a DataProvider'); }
  return context;
};
