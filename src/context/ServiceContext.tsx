// Helper to safely parse JSON from localStorage (for arrays only)
function getArrayFromStorage<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  try {
    const parsed = stored ? JSON.parse(stored) : undefined;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServiceRequest, Mechanic, Invoice, Vehicle } from '../types';
import { serviceRequestAPI, mechanicAPI, invoiceAPI, vehiclesAPI } from '../services/api';
import { useToast } from './ToastContext';

// Helper to check if two mechanics are the same (by email)
function isSameMechanic(a: Mechanic, b: Mechanic) {
  return a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase();
}

interface MechanicWithSync extends Mechanic {
  unsynced?: boolean;
}

interface ServiceContextType {
  serviceRequests: ServiceRequest[];
  mechanics: MechanicWithSync[];
  invoices: Invoice[];
  vehicles: Vehicle[];
  loading: boolean;
  addMechanic: (mechanic: Omit<Mechanic, 'id' | 'vehicles'>) => Promise<void>;
  updateServiceRequest: (id: number, request: Partial<ServiceRequest>) => Promise<void>;
  deleteServiceRequest: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  clearAllData: () => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt'>) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => getArrayFromStorage('serviceRequests', []));
  const [mechanics, setMechanics] = useState<MechanicWithSync[]>(() => getArrayFromStorage('mechanics', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getArrayFromStorage('invoices', []));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Helper to sync unsynced mechanics to backend
  const syncUnsyncedMechanics = useCallback(async (unsyncedMechanics: MechanicWithSync[]) => {
    for (const mechanic of unsyncedMechanics) {
      try {
        const { unsynced, ...mechanicData } = mechanic;
        const response = await mechanicAPI.create(mechanicData);
        if (response.success && response.data) {
          showToast(`Mechanic ${mechanic.name} synced to backend!`, 'success');
        }
      } catch (e) {
        // If still offline, skip
      }
    }
  }, [showToast]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, mechanicsRes, invoicesRes, vehiclesRes] = await Promise.all([
        serviceRequestAPI.getAll(),
        mechanicAPI.getAll(),
        invoiceAPI.getAll(),
        vehiclesAPI.getAll()
      ]);

      // Mechanics merging logic
      let backendMechanics: MechanicWithSync[] = [];
      if (mechanicsRes.success && Array.isArray(mechanicsRes.data)) {
        backendMechanics = mechanicsRes.data;
      }
      // Get local mechanics
      const localMechanics: MechanicWithSync[] = getArrayFromStorage('mechanics', []);
      // Find unsynced (local only) mechanics
      const unsyncedMechanics = localMechanics.filter(
        lm => !backendMechanics.some(bm => isSameMechanic(lm, bm))
      ).map(m => ({ ...m, unsynced: true }));
      // Merge
      const mergedMechanics = [...backendMechanics, ...unsyncedMechanics];
      setMechanics(mergedMechanics);
      localStorage.setItem('mechanics', JSON.stringify(mergedMechanics));

      // Sync unsynced mechanics to backend
      if (unsyncedMechanics.length > 0) {
        await syncUnsyncedMechanics(unsyncedMechanics);
        // After syncing, re-fetch from backend to get updated list
        const refreshed = await mechanicAPI.getAll();
        if (refreshed.success && Array.isArray(refreshed.data)) {
          setMechanics(refreshed.data);
          localStorage.setItem('mechanics', JSON.stringify(refreshed.data));
        }
      }

      if (vehiclesRes.success && Array.isArray(vehiclesRes.data)) {
        // Ensure all vehicle IDs are numbers
        const vehiclesWithNumberId = vehiclesRes.data.map(v => ({ ...v, id: Number(v.id) }));
        setVehicles(vehiclesWithNumberId);
        localStorage.setItem('vehicles', JSON.stringify(vehiclesWithNumberId));
        console.log('Vehicles loaded:', vehiclesWithNumberId);
      }
      if (requestsRes.success) {
        setServiceRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
        localStorage.setItem('serviceRequests', JSON.stringify(requestsRes.data));
        console.log('ServiceRequests loaded:', requestsRes.data);
      }
      if (invoicesRes.success) {
        setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
        localStorage.setItem('invoices', JSON.stringify(invoicesRes.data));
      }
    } catch (error) {
      console.error("Failed to refresh data from backend, using local data.", error);
      showToast('Could not connect to the server. Displaying local data.', 'warning');
      // On error, just use local mechanics
      setMechanics(getArrayFromStorage('mechanics', []));
      setVehicles(getArrayFromStorage('vehicles', []));
    } finally {
      setLoading(false);
    }
  }, [showToast, syncUnsyncedMechanics]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addMechanic = async (mechanic: Omit<Mechanic, 'id' | 'vehicles'>) => {
    try {
      const response = await mechanicAPI.create(mechanic);
      if (response.success && response.data) {
        await refreshData();
        showToast('Mechanic registered successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to register mechanic on backend.');
      }
    } catch (error) {
      console.warn('Backend call failed, saving mechanic locally.', error);
      const localMechanic: MechanicWithSync = {
        ...mechanic,
        id: Date.now(),
        vehicles: [],
        unsynced: true,
      };
      setMechanics((prev) => {
        const updated = [...prev, localMechanic];
        localStorage.setItem('mechanics', JSON.stringify(updated));
        return updated;
      });
      showToast('Mechanic saved locally in offline mode.', 'info');
    }
  };

  const updateServiceRequest = async (id: number, request: Partial<ServiceRequest>) => {
    try {
      const response = await serviceRequestAPI.update(id, request);
      if (response.success && response.data) {
        setServiceRequests(prevState => {
          const updated = prevState.map(req => req.id === id ? response.data : req).filter((req): req is ServiceRequest => !!req);
          localStorage.setItem('serviceRequests', JSON.stringify(updated));
          return updated;
        });
        showToast('Service Request updated.', 'success');
      } else {
        throw new Error(response.error || 'Failed to update service request on backend.');
      }
    } catch (error) {
      console.warn('Backend call failed, updating service request locally.', error);
      setServiceRequests(prevState => {
        const updated = prevState.map(req => req.id === id ? { ...req, ...request } : req).filter((req): req is ServiceRequest => !!req);
        localStorage.setItem('serviceRequests', JSON.stringify(updated));
        return updated;
      });
      showToast('Service Request updated locally.', 'info');
    }
  };

  const deleteServiceRequest = async (id: number) => {
    try {
      const response = await serviceRequestAPI.delete(id);
      if (response.success) {
        setServiceRequests(prevState => {
          const updated = prevState.filter(req => req.id !== id);
          localStorage.setItem('serviceRequests', JSON.stringify(updated));
          return updated;
        });
        showToast('Service Request deleted.', 'success');
      } else {
        throw new Error(response.error || 'Failed to delete service request on backend.');
      }
    } catch (error) {
      console.warn('Backend call failed, deleting service request locally.', error);
      setServiceRequests(prevState => {
        const updated = prevState.filter(req => req.id !== id);
        localStorage.setItem('serviceRequests', JSON.stringify(updated));
        return updated;
      });
      showToast('Service Request deleted locally.', 'info');
    }
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const response = await invoiceAPI.create(invoice);
      if (response.success && response.data) {
        setInvoices(prevState => {
          const updated = [...prevState, response.data].filter((inv): inv is Invoice => !!inv);
          localStorage.setItem('invoices', JSON.stringify(updated));
          return updated;
        });
        showToast('Invoice created.', 'success');
      } else {
        throw new Error(response.error || 'Failed to create invoice on backend.');
      }
    } catch (error) {
      console.warn('Backend call failed, creating invoice locally.', error);
      const localInvoice: Invoice = {
        ...invoice,
        id: Date.now(),
      };
      setInvoices(prevState => {
        const updated = [...prevState, localInvoice].filter((inv): inv is Invoice => !!inv);
        localStorage.setItem('invoices', JSON.stringify(updated));
        return updated;
      });
      showToast('Invoice created locally.', 'info');
    }
  };

  const addServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'createdAt'>) => {
    try {
      const response = await serviceRequestAPI.create(request);
      if (response.success && response.data) {
        setServiceRequests(prev => {
          const updated = [...prev, response.data].filter((req): req is ServiceRequest => !!req);
          localStorage.setItem('serviceRequests', JSON.stringify(updated));
          return updated;
        });
        showToast('Service request submitted successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to submit service request.');
      }
    } catch (error) {
      showToast('Failed to submit service request. Please try again.', 'error');
      console.error('Error in addServiceRequest:', error);
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('serviceRequests');
    localStorage.removeItem('mechanics');
    localStorage.removeItem('invoices');
    setServiceRequests([]);
    setMechanics([]);
    setInvoices([]);
    showToast('All local data has been cleared.', 'info');
  };

  return (
    <ServiceContext.Provider value={{ 
        serviceRequests, mechanics, invoices, vehicles, loading, 
        addMechanic, updateServiceRequest, deleteServiceRequest, 
        refreshData, clearAllData, addInvoice, addServiceRequest 
    }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};