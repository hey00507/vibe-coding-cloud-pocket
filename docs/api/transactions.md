# Transaction API

거래 관리 서비스 API 명세서입니다.

## 타입 정의

```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  categoryId: string;
  paymentMethodId: string;
  memo?: string;
}

type CreateTransactionInput = Omit<Transaction, 'id'>;
type UpdateTransactionInput = Partial<Omit<Transaction, 'id'>>;
```

## 메서드

### create(input: CreateTransactionInput): Transaction

새 거래를 생성합니다.

**매개변수**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| type | 'income' \| 'expense' | O | 거래 유형 |
| amount | number | O | 금액 |
| date | Date | O | 거래 날짜 |
| categoryId | string | O | 카테고리 ID |
| paymentMethodId | string | O | 결제수단 ID |
| memo | string | X | 메모 |

**반환값**: 생성된 `Transaction` 객체

**예시**
```typescript
const transaction = transactionService.create({
  type: 'expense',
  amount: 15000,
  date: new Date('2024-01-15'),
  categoryId: 'category-1',
  paymentMethodId: 'payment-1',
  memo: '점심 식사',
});
```

---

### getById(id: string): Transaction | undefined

ID로 거래를 조회합니다.

**반환값**: `Transaction` 또는 `undefined`

---

### getAll(): Transaction[]

모든 거래를 조회합니다.

**반환값**: `Transaction` 배열

---

### getByType(type: TransactionType): Transaction[]

거래 유형별로 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| type | 'income' \| 'expense' | 거래 유형 |

**반환값**: 해당 유형의 `Transaction` 배열

**예시**
```typescript
const expenses = transactionService.getByType('expense');
const incomes = transactionService.getByType('income');
```

---

### getByDateRange(startDate: Date, endDate: Date): Transaction[]

날짜 범위로 거래를 조회합니다. 시작일과 종료일을 포함합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| startDate | Date | 시작 날짜 |
| endDate | Date | 종료 날짜 |

**반환값**: 해당 기간의 `Transaction` 배열

**예시**
```typescript
const january = transactionService.getByDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

---

### getByCategoryId(categoryId: string): Transaction[]

카테고리별로 거래를 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| categoryId | string | 카테고리 ID |

**반환값**: 해당 카테고리의 `Transaction` 배열

---

### getByPaymentMethodId(paymentMethodId: string): Transaction[]

결제수단별로 거래를 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| paymentMethodId | string | 결제수단 ID |

**반환값**: 해당 결제수단의 `Transaction` 배열

---

### update(id: string, input: UpdateTransactionInput): Transaction | undefined

거래를 수정합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 거래 ID |
| input | UpdateTransactionInput | 수정할 필드들 |

**반환값**: 수정된 `Transaction` 또는 `undefined` (존재하지 않는 경우)

**예시**
```typescript
const updated = transactionService.update(transaction.id, {
  amount: 20000,
  memo: '저녁 식사로 변경',
});
```

---

### delete(id: string): boolean

거래를 삭제합니다.

**반환값**: 삭제 성공 시 `true`, 존재하지 않는 경우 `false`

---

### clear(): void

모든 거래를 삭제합니다. (테스트용)

---

## 집계 메서드

### getTotalIncome(): number

총 수입을 계산합니다.

**반환값**: 모든 수입 거래 금액의 합

**예시**
```typescript
const totalIncome = transactionService.getTotalIncome();
// 150000
```

---

### getTotalExpense(): number

총 지출을 계산합니다.

**반환값**: 모든 지출 거래 금액의 합

**예시**
```typescript
const totalExpense = transactionService.getTotalExpense();
// 50000
```

---

### getBalance(): number

잔액을 계산합니다 (수입 - 지출).

**반환값**: 총 수입에서 총 지출을 뺀 금액

**예시**
```typescript
const balance = transactionService.getBalance();
// 100000 (수입 150000 - 지출 50000)
```
