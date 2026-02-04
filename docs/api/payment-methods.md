# PaymentMethod API

결제수단 관리 서비스 API 명세서입니다.

## 타입 정의

```typescript
interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

type CreatePaymentMethodInput = Omit<PaymentMethod, 'id'>;
type UpdatePaymentMethodInput = Partial<Omit<PaymentMethod, 'id'>>;
```

## 메서드

### create(input: CreatePaymentMethodInput): PaymentMethod

새 결제수단을 생성합니다.

**매개변수**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | O | 결제수단 이름 |
| icon | string | X | 아이콘 (이모지) |

**반환값**: 생성된 `PaymentMethod` 객체

**예시**
```typescript
const card = paymentMethodService.create({
  name: '신용카드',
  icon: '💳',
});
// { id: 'payment-method-1-...', name: '신용카드', icon: '💳' }
```

---

### getById(id: string): PaymentMethod | undefined

ID로 결제수단을 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제수단 ID |

**반환값**: `PaymentMethod` 또는 `undefined`

---

### getAll(): PaymentMethod[]

모든 결제수단을 조회합니다.

**반환값**: `PaymentMethod` 배열

**예시**
```typescript
const methods = paymentMethodService.getAll();
// [{ id: '...', name: '신용카드', icon: '💳' }, { id: '...', name: '현금', icon: '💵' }]
```

---

### update(id: string, input: UpdatePaymentMethodInput): PaymentMethod | undefined

결제수단을 수정합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제수단 ID |
| input | UpdatePaymentMethodInput | 수정할 필드들 |

**반환값**: 수정된 `PaymentMethod` 또는 `undefined` (존재하지 않는 경우)

**예시**
```typescript
const updated = paymentMethodService.update(card.id, {
  name: '삼성카드',
});
```

---

### delete(id: string): boolean

결제수단을 삭제합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제수단 ID |

**반환값**: 삭제 성공 시 `true`, 존재하지 않는 경우 `false`

---

### clear(): void

모든 결제수단을 삭제합니다. (테스트용)
