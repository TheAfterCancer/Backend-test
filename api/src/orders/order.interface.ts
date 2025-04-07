export interface Order {
    id: string;
    userId: string;
    items: { productId: string, quantity: number }[];
    status: string;
    createdAt: string;
  }
  