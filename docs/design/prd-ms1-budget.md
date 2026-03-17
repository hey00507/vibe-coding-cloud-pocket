# MS1: 예산 기능 PRD

## 개요
카테고리별 월간 예산 설정 + 소진률 시각화. 앱의 핵심 가치 — "얼마나 썼는지 한 눈에".

## 현재 상태
- IncomeTargetService: 수입 목표만 (지출 예산 없음)
- 통계 화면: DonutChart/BarChart 있지만 예산 대비 소진률 없음
- 스프레드시트: 예산 영역 없음 (스캔 완료 2026-03-16)

## 확정 요구사항

| 항목 | 결정 |
|------|------|
| 저장소 | 앱 로컬 (AsyncStorage) — 시트 구조 불변 |
| 예산 단위 | 카테고리별 월 예산 (대분류 기준) |
| 알림 | 80% 경고 + 100% 초과 (앱 내 배너/색상) |
| UI 배치 | Home 탭 상단 (공간 부족 시 별도 탭 고려) |
| 설정 | Settings에서 카테고리별 금액 입력 |

## 구현 항목

### 1. BudgetService (TDD)
```typescript
interface Budget {
  id: string;
  categoryId: string;
  monthlyAmount: number;  // 월 예산 금액
  year: number;
  month: number;
}

interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budget: number;         // 설정 예산
  spent: number;          // 실제 지출
  remaining: number;      // 남은 금액
  percentage: number;     // 소진률 (0~100+)
  status: 'safe' | 'warning' | 'over';  // ~50% | ~80% | 80%+
}
```

- 카테고리별 월 예산 CRUD
- 소진률 계산 (실제 지출 / 예산 × 100)
- 전체 월 예산 합계 vs 전체 지출 합계
- AsyncStorage 영속화
- 월이 바뀌면 이전 월 예산을 자동 복사 (매달 재설정 불필요)

### 2. BudgetProgressBar 컴포넌트
- 전체 예산 프로그레스 바 (큰 바)
- 카테고리별 미니 바 (상위 5개, 소진률 높은 순)
- 색상 기준:
  - ~50%: 초록 (theme.colors.income)
  - 50~80%: 주황 (theme.colors.warning)
  - 80%+: 빨강 (theme.colors.expense)
- 금액 표시: "23.4만 / 30만 (78%)"

### 3. Home 화면 통합
```
┌─────────────────────────────┐
│ 전체 예산                    │
│ ██████░░░░ 62% (62만/100만)  │
│                             │
│ 식비  ███████░ 78%           │
│ 교통  ███░░░░░ 35%           │
│ 여가  █████████ 95% ⚠️       │
│        [더보기 ▼]            │
├─────────────────────────────┤
│ 오늘의 거래                  │
│ ...                         │
```
- 접기/펼치기 가능 (공간 부족 대비)
- 예산 미설정 시 "예산을 설정해보세요" CTA 표시

### 4. Settings 예산 탭
- 기존 탭(category/paymentMethod)에 'budget' 탭 추가
- 카테고리 목록 + 각각 금액 입력 필드
- 전체 합계 표시

### 5. 테스트
- BudgetService: CRUD, 소진률 계산, 월 자동 복사, 영속화
- BudgetProgressBar: 색상 변환, 퍼센티지 계산, 빈 상태
- Home 통합: 예산 섹션 렌더링, 접기/펼치기

## 작업 순서

```
1단계: BudgetService 타입 정의 + 인터페이스
2단계: BudgetService TDD (테스트 → 구현 → 검증)
3단계: BudgetProgressBar 컴포넌트 TDD
4단계: Settings 예산 탭 구현
5단계: Home 화면 통합
6단계: 전체 테스트 + 커밋
```

## 완료 기준
- [x] 카테고리별 월 예산 설정 가능
- [x] Home에서 소진률 프로그레스 바 확인 가능
- [x] 80% 도달 시 경고 색상, 100% 초과 시 빨간색
- [x] 테스트 커버리지 80% 이상 유지 (87.57%)
- [x] 661개+ 테스트 전체 통과 (705개)
