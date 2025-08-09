export interface item {
  id: string;
  seller: string;
  customer: string;
  name: string;
  detail: string;
  image: string;
  is_purchased: boolean;
  is_active: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  name: string;
}
