# Category API

카테고리 관리 서비스 API 명세서입니다.

## 타입 정의

```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

type CreateCategoryInput = Omit<Category, 'id'>;
type UpdateCategoryInput = Partial<Omit<Category, 'id'>>;
```

## 메서드

### create(input: CreateCategoryInput): Category

새 카테고리를 생성합니다.

**매개변수**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | O | 카테고리 이름 |
| type | 'income' \| 'expense' | O | 거래 유형 |
| icon | string | X | 아이콘 (이모지) |
| color | string | X | 색상 코드 |

**반환값**: 생성된 `Category` 객체

**예시**
```typescript
const category = categoryService.create({
  name: '식비',
  type: 'expense',
  icon: '🍔',
  color: '#FF5733',
});
// { id: 'category-1-...', name: '식비', type: 'expense', icon: '🍔', color: '#FF5733' }
```

---

### getById(id: string): Category | undefined

ID로 카테고리를 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 카테고리 ID |

**반환값**: `Category` 또는 `undefined`

---

### getAll(): Category[]

모든 카테고리를 조회합니다.

**반환값**: `Category` 배열

---

### getByType(type: TransactionType): Category[]

거래 유형별로 카테고리를 조회합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| type | 'income' \| 'expense' | 거래 유형 |

**반환값**: 해당 유형의 `Category` 배열

**예시**
```typescript
const expenseCategories = categoryService.getByType('expense');
// [{ id: '...', name: '식비', type: 'expense', ... }, ...]
```

---

### update(id: string, input: UpdateCategoryInput): Category | undefined

카테고리를 수정합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 카테고리 ID |
| input | UpdateCategoryInput | 수정할 필드들 |

**반환값**: 수정된 `Category` 또는 `undefined` (존재하지 않는 경우)

**예시**
```typescript
const updated = categoryService.update(category.id, {
  name: '외식비',
  icon: '🍕',
});
```

---

### delete(id: string): boolean

카테고리를 삭제합니다.

**매개변수**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 카테고리 ID |

**반환값**: 삭제 성공 시 `true`, 존재하지 않는 경우 `false`

---

### clear(): void

모든 카테고리를 삭제합니다. (테스트용)
