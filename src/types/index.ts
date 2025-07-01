export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  vinNumber?: string;
  mileage?: number;
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: number;
  vehicleId: number;
  mechanicId?: number;
  mechanicName?: string;
  description: string;
  serviceType: string;
  priority: string;
  preferredDate: string;
  createdAt: string;
  status: string;
  mechanicNotes?: string;
  assignedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
}

// Mechanic is just a User with role=MECHANIC
export interface Mechanic extends Omit<User, 'role'> {
  role: 'MECHANIC';
  password?: string; // For creation
}

export interface ServiceItem {
  id?: number;
  invoiceId?: number;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  type?: string;
  partNumber?: string;
  warrantyInfo?: string;
}

export interface Invoice {
  id?: number;
  serviceRequestId?: number;
  totalAmount: number;
  status: string;
  createdAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  cardLastFour?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  serviceItems: ServiceItem[];
}