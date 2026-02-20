// CloudPocket 타입 정의

// 거래 유형
export type TransactionType = 'income' | 'expense';

// 카테고리 (대분류)
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

// 소분류 카테고리
export interface SubCategory {
  id: string;
  categoryId: string; // 대분류 참조
  name: string;
  icon?: string;
}

// 소분류 생성 시 필요한 데이터
export type CreateSubCategoryInput = Omit<SubCategory, 'id'>;

// 소분류 수정 시 필요한 데이터
export type UpdateSubCategoryInput = Partial<Omit<SubCategory, 'id'>>;

// 결제수단 유형
export type PaymentMethodType = 'credit' | 'debit' | 'cash' | 'account';

// 결제수단
export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  type?: PaymentMethodType;
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
  subCategoryId?: string;
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

// 저축 상품 상태
export type SavingsProductStatus = 'active' | 'pending';

// 저축 상품
export interface SavingsProduct {
  id: string;
  name: string;
  status: SavingsProductStatus;
  interestRate: number; // 금리 (%)
  bank: string;
  startDate?: Date;
  endDate?: Date;
  monthlyAmount: number;
  paidMonths: number;
  currentAmount: number;
  memo?: string;
}

// 저축 상품 생성 시 필요한 데이터
export type CreateSavingsProductInput = Omit<SavingsProduct, 'id'>;

// 저축 상품 수정 시 필요한 데이터
export type UpdateSavingsProductInput = Partial<Omit<SavingsProduct, 'id'>>;

// 은행 등급
export type BankTier = 'primary' | 'secondary' | 'savings_bank';

// 은행 계좌
export interface BankAccount {
  id: string;
  bank: string;
  purpose: string;
  balance: number;
  tier: BankTier;
  isActive: boolean;
}

// 은행 계좌 생성 시 필요한 데이터
export type CreateBankAccountInput = Omit<BankAccount, 'id'>;

// 은행 계좌 수정 시 필요한 데이터
export type UpdateBankAccountInput = Partial<Omit<BankAccount, 'id'>>;

// 수입 목표
export interface IncomeTarget {
  id: string;
  categoryId: string;
  year: number;
  month: number;
  targetAmount: number;
}

// 수입 목표 생성 시 필요한 데이터
export type CreateIncomeTargetInput = Omit<IncomeTarget, 'id'>;

// 수입 목표 수정 시 필요한 데이터
export type UpdateIncomeTargetInput = Partial<Omit<IncomeTarget, 'id'>>;

// 연간 대시보드: 월별 카테고리 매트릭스
export interface MonthlyCategoryMatrix {
  categoryId: string;
  categoryName: string;
  monthlyAmounts: number[]; // 12개 (1월~12월)
  total: number;
}

// 월간 상세 요약 (확장)
export interface EnhancedMonthlySummary extends PeriodSummary {
  totalSavings: number;
  savingsRate: number; // 저축률 (%)
  remainingCash: number; // 잔여 현금
  salarySavingsRate: number; // 급여 대비 저축률 (%)
}
