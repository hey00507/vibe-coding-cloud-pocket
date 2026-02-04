// CloudPocket 타입 정의
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}
