// CloudPocket 타입 정의

// 거래 유형
export type TransactionType = 'income' | 'expense';

// 카테고리
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

// 카테고리 생성 시 필요한 데이터 (id 제외)
export type CreateCategoryInput = Omit<Category, 'id'>;

// 카테고리 수정 시 필요한 데이터 (부분 업데이트)
export type UpdateCategoryInput = Partial<Omit<Category, 'id'>>;

// 결제수단
export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

// 결제수단 생성 시 필요한 데이터
export type CreatePaymentMethodInput = Omit<PaymentMethod, 'id'>;

// 결제수단 수정 시 필요한 데이터
export type UpdatePaymentMethodInput = Partial<Omit<PaymentMethod, 'id'>>;

// 거래
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  categoryId: string;
  paymentMethodId: string;
  memo?: string;
}

// 거래 생성 시 필요한 데이터
export type CreateTransactionInput = Omit<Transaction, 'id'>;

// 거래 수정 시 필요한 데이터
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id'>>;

// 일별 거래 요약
export interface DailySummary {
  date: string; // 'YYYY-MM-DD' 형식
  totalIncome: number;
  totalExpense: number;
  balance: number; // income - expense
  transactionCount: number;
}

// 기간 유형 (통계)
export type PeriodType = 'monthly' | 'yearly';

// 기간별 요약 (통계)
export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

// 카테고리별 집계 (통계)
export interface CategoryBreakdown {
  categoryId: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// 결제수단별 집계 (통계)
export interface PaymentMethodBreakdown {
  paymentMethodId: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}
