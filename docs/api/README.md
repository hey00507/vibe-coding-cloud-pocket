# CloudPocket API 문서

## 개요

CloudPocket의 서비스 레이어 API 명세서입니다. 현재 메모리 캐시 기반으로 동작하며, 추후 Google Sheets 연동이 예정되어 있습니다.

## 서비스 목록

| 서비스 | 설명 | 문서 |
|--------|------|------|
| CategoryService | 카테고리 관리 (수입/지출 분류) | [categories.md](./categories.md) |
| PaymentMethodService | 결제수단 관리 | [payment-methods.md](./payment-methods.md) |
| TransactionService | 거래 관리 (수입/지출 기록) | [transactions.md](./transactions.md) |

## 공통 사항

### 타입 정의

모든 타입은 `src/types/index.ts`에 정의되어 있습니다.

```typescript
// 거래 유형
type TransactionType = 'income' | 'expense';
```

### ID 생성

모든 엔티티의 ID는 서비스에서 자동 생성됩니다.
- 형식: `{entity}-{counter}-{timestamp}`
- 예시: `category-1-1706745600000`

### 에러 처리

- 존재하지 않는 엔티티 조회/수정 시: `undefined` 반환
- 존재하지 않는 엔티티 삭제 시: `false` 반환

## 사용 예시

```typescript
import { CategoryService } from './services/CategoryService';
import { PaymentMethodService } from './services/PaymentMethodService';
import { TransactionService } from './services/TransactionService';

// 서비스 인스턴스 생성
const categoryService = new CategoryService();
const paymentMethodService = new PaymentMethodService();
const transactionService = new TransactionService();

// 카테고리 생성
const foodCategory = categoryService.create({
  name: '식비',
  type: 'expense',
  icon: '🍔',
  color: '#FF5733',
});

// 결제수단 생성
const card = paymentMethodService.create({
  name: '신용카드',
  icon: '💳',
});

// 거래 생성
const transaction = transactionService.create({
  type: 'expense',
  amount: 15000,
  date: new Date(),
  categoryId: foodCategory.id,
  paymentMethodId: card.id,
  memo: '점심 식사',
});

// 잔액 조회
console.log('잔액:', transactionService.getBalance());
```

## 디렉토리 구조

```
src/
├── types/
│   └── index.ts              # 타입 정의
└── services/
    ├── interfaces/
    │   ├── ICategoryService.ts
    │   ├── IPaymentMethodService.ts
    │   └── ITransactionService.ts
    ├── CategoryService.ts
    ├── PaymentMethodService.ts
    └── TransactionService.ts
```
