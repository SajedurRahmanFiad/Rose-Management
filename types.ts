
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Company {
  RESEVALLEY = 'Resevalley',
  ROSEWORLD = 'Roseworld'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string;
  company: Company;
  profilePicture?: string;
}

export interface Order {
  id: string;
  company: Company;
  content: string;
  status: OrderStatus;
  createdBy: string;
  creatorName: string;
  createdAt: number;
}

export interface Product {
  id: string;
  company: Company;
  name: string;
  category: string;
  salePrice: number;
  purchasePrice: number;
  image?: string;
  description?: string;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
  description: string;
  color: string;
}
