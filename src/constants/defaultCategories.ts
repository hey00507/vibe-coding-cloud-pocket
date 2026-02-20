import { TransactionType, PaymentMethodType } from '../types';

// 대분류 카테고리 정의
export interface DefaultCategory {
  name: string;
  type: TransactionType;
  icon: string;
  subCategories: { name: string; icon: string }[];
}

// 기본 지출 대분류 (10개) + 소분류 — 엑셀 설정 시트 기반
export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  {
    name: '고정비',
    type: 'expense',
    icon: '🏠',
    subCategories: [
      { name: '월세/관리비', icon: '🏢' },
      { name: '통신비', icon: '📱' },
      { name: '보험료', icon: '🛡️' },
      { name: '구독서비스', icon: '📺' },
    ],
  },
  {
    name: '식비',
    type: 'expense',
    icon: '🍔',
    subCategories: [
      { name: '식료품', icon: '🛒' },
      { name: '외식', icon: '🍽️' },
      { name: '간식/카페', icon: '☕' },
      { name: '배달', icon: '🛵' },
    ],
  },
  {
    name: '교통비',
    type: 'expense',
    icon: '🚗',
    subCategories: [
      { name: '대중교통', icon: '🚌' },
      { name: '택시', icon: '🚕' },
      { name: '주유', icon: '⛽' },
      { name: '주차/톨게이트', icon: '🅿️' },
    ],
  },
  {
    name: '생활용품',
    type: 'expense',
    icon: '🧴',
    subCategories: [
      { name: '일용품', icon: '🧻' },
      { name: '가전/가구', icon: '🪑' },
      { name: '의류/패션', icon: '👕' },
    ],
  },
  {
    name: '의료/건강',
    type: 'expense',
    icon: '💊',
    subCategories: [
      { name: '병원', icon: '🏥' },
      { name: '약국', icon: '💊' },
      { name: '운동/헬스', icon: '🏋️' },
    ],
  },
  {
    name: '문화/여가',
    type: 'expense',
    icon: '🎮',
    subCategories: [
      { name: '영화/공연', icon: '🎬' },
      { name: '취미', icon: '🎨' },
      { name: '도서', icon: '📚' },
      { name: '여행', icon: '✈️' },
    ],
  },
  {
    name: '교육',
    type: 'expense',
    icon: '📚',
    subCategories: [
      { name: '학원/강의', icon: '🎓' },
      { name: '교재/자격증', icon: '📖' },
    ],
  },
  {
    name: '경조사/선물',
    type: 'expense',
    icon: '🎁',
    subCategories: [
      { name: '축의금/부의금', icon: '💐' },
      { name: '선물', icon: '🎀' },
    ],
  },
  {
    name: '반려동물',
    type: 'expense',
    icon: '🐾',
    subCategories: [
      { name: '사료/간식', icon: '🦴' },
      { name: '병원/미용', icon: '🩺' },
      { name: '용품', icon: '🧸' },
    ],
  },
  {
    name: '기타지출',
    type: 'expense',
    icon: '📦',
    subCategories: [
      { name: '기타', icon: '📋' },
    ],
  },
];

// 기본 수입 카테고리 (flat — 소분류 없음)
export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  {
    name: '월급',
    type: 'income',
    icon: '💰',
    subCategories: [],
  },
  {
    name: '상여금',
    type: 'income',
    icon: '🎉',
    subCategories: [],
  },
  {
    name: '금융소득',
    type: 'income',
    icon: '📈',
    subCategories: [],
  },
  {
    name: '부수입',
    type: 'income',
    icon: '💼',
    subCategories: [],
  },
  {
    name: '기타수입',
    type: 'income',
    icon: '📋',
    subCategories: [],
  },
];

// 기본 결제수단
export interface DefaultPaymentMethod {
  name: string;
  icon: string;
  type: PaymentMethodType;
}

export const DEFAULT_PAYMENT_METHODS: DefaultPaymentMethod[] = [
  { name: '신한카드', icon: '💳', type: 'credit' },
  { name: '현대카드', icon: '💳', type: 'debit' },
  { name: '현금', icon: '💵', type: 'cash' },
];
