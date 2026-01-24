
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
  username: string;
  role: UserRole;
  password?: string;
  company: Company;
  profilePicture?: string; // base64 or URL
}

export interface Order {
  id: string;
  company: Company;
  content: string; // The "note" containing customer info
  status: OrderStatus;
  createdBy: string; // User ID
  creatorName: string;
  createdAt: number;
}
