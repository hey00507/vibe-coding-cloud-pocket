# Phase 3: 고도화 작업 목록

## 개요
자산 관리, 예산 설정, 통계 분석 등 고급 재정 관리 기능

> **선행 조건**: Phase 2 Google Sheets 연동 완료

### 개발 방법론
- **TDD (Test-Driven Development)**: 테스트 코드 먼저 작성 → 테스트 통과하는 코드 구현 → 리팩토링
- **도메인 단위 개발**: Account, Budget, Statistics, Recurring, Export, Category 도메인으로 분리
- **인터페이스 기반 설계**: 각 서비스는 인터페이스 먼저 정의

### TDD 작업 흐름
```
1. 테스트 파일 생성 (*.test.ts / *.spec.ts)
2. 실패하는 테스트 작성 (Red)
3. 테스트 통과하는 최소 구현 (Green)
4. 코드 정리 및 개선 (Refactor)
5. 다음 테스트 케이스로 반복
```

---

## 1. 자산 관리 (Account 도메인)

### 1.1 데이터 모델 확장
- [ ] `src/types/account.ts` 생성
  - [ ] `Account` 인터페이스 정의
  - [ ] `CreateAccountDTO` 타입 정의
  - [ ] `UpdateAccountDTO` 타입 정의
  - [ ] `Transfer` 타입 정의 (계좌 간 이체)
- [ ] `Transaction`에 `accountId` 필드 추가

### 1.2 계좌 관리 서비스 (TDD)
- [ ] **인터페이스**: `src/services/interfaces/IAccountService.ts` 생성
  - [ ] `getAll(): Promise<Account[]>`
  - [ ] `getById(id: string): Promise<Account | null>`
  - [ ] `create(data: CreateAccountDTO): Promise<Account>`
  - [ ] `update(id: string, data: UpdateAccountDTO): Promise<Account>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `getBalance(id: string): Promise<number>`
  - [ ] `getTotalBalance(): Promise<number>`

- [ ] **테스트 먼저**: `__tests__/services/LocalAccountService.test.ts` 생성
  - [ ] CRUD 테스트 케이스
  - [ ] 잔액 계산 테스트
  - [ ] 총 자산 계산 테스트

- [ ] **구현**: `src/services/LocalAccountService.ts` 구현

- [ ] **테스트 먼저**: `__tests__/services/GoogleSheetsAccountService.test.ts` 생성

- [ ] **구현**: `src/services/GoogleSheetsAccountService.ts` 구현

- [ ] **검증**: 모든 테스트 통과 확인

### 1.3 계좌 컨트롤러 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useAccounts.test.ts` 생성
- [ ] **구현**: `src/controllers/useAccounts.ts` 생성
- [ ] **검증**: 테스트 통과 확인

### 1.4 계좌 UI 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/account/AccountCard.test.tsx`
- [ ] **구현**: `src/views/components/account/AccountCard.tsx`
- [ ] **검증**: 테스트 통과

- [ ] **테스트 먼저**: `__tests__/components/account/AccountForm.test.tsx`
- [ ] **구현**: `src/views/components/account/AccountForm.tsx`
- [ ] **검증**: 테스트 통과

- [ ] **테스트 먼저**: `__tests__/components/account/AccountPicker.test.tsx`
- [ ] **구현**: `src/views/components/account/AccountPicker.tsx`
- [ ] **검증**: 테스트 통과

### 1.5 계좌 스크린
- [ ] `src/views/screens/AccountsScreen.tsx` 생성
- [ ] `src/views/screens/TransferScreen.tsx` 생성

### 1.6 네비게이션 확장
- [ ] Tab에 Assets 탭 추가

### 1.7 API 문서화
- [ ] `docs/api/account-service.md` 생성
- [ ] `docs/api/examples/account-create.json`
- [ ] `docs/api/examples/account-response.json`

---

## 2. 예산 관리 (Budget 도메인)

### 2.1 데이터 모델
- [ ] `src/types/budget.ts` 생성
  - [ ] `Budget` 인터페이스 정의
  - [ ] `BudgetProgress` 인터페이스 정의
  - [ ] `CreateBudgetDTO`, `UpdateBudgetDTO` 타입 정의

### 2.2 예산 서비스 (TDD)
- [ ] **인터페이스**: `src/services/interfaces/IBudgetService.ts` 생성
  - [ ] `getAll(): Promise<Budget[]>`
  - [ ] `getById(id: string): Promise<Budget | null>`
  - [ ] `create(data: CreateBudgetDTO): Promise<Budget>`
  - [ ] `update(id: string, data: UpdateBudgetDTO): Promise<Budget>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `getProgress(budgetId: string): Promise<BudgetProgress>`
  - [ ] `getAllProgress(): Promise<BudgetProgress[]>`

- [ ] **테스트 먼저**: `__tests__/services/LocalBudgetService.test.ts` 생성
  - [ ] CRUD 테스트 케이스
  - [ ] 진행률 계산 테스트
  - [ ] 초과 예산 감지 테스트

- [ ] **구현**: `src/services/LocalBudgetService.ts` 구현

- [ ] **테스트 먼저**: `__tests__/services/GoogleSheetsBudgetService.test.ts`

- [ ] **구현**: `src/services/GoogleSheetsBudgetService.ts` 구현

- [ ] **검증**: 모든 테스트 통과 확인

### 2.3 예산 컨트롤러 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useBudgets.test.ts`
- [ ] **구현**: `src/controllers/useBudgets.ts`
- [ ] **검증**: 테스트 통과 확인

### 2.4 예산 UI 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/budget/BudgetCard.test.tsx`
- [ ] **구현**: `src/views/components/budget/BudgetCard.tsx`

- [ ] **테스트 먼저**: `__tests__/components/budget/BudgetProgressBar.test.tsx`
- [ ] **구현**: `src/views/components/budget/BudgetProgressBar.tsx`

- [ ] **테스트 먼저**: `__tests__/components/budget/BudgetForm.test.tsx`
- [ ] **구현**: `src/views/components/budget/BudgetForm.tsx`

### 2.5 예산 스크린
- [ ] `src/views/screens/BudgetScreen.tsx` 생성

### 2.6 예산 알림 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/NotificationService.test.ts`
- [ ] **구현**: `src/services/NotificationService.ts`
  - [ ] 예산 80% 도달 알림
  - [ ] 예산 초과 알림
  - [ ] 알림 스케줄링
- [ ] 푸시 알림 설정 (expo-notifications)

### 2.7 API 문서화
- [ ] `docs/api/budget-service.md` 생성
- [ ] `docs/api/examples/budget-progress.json`

---

## 3. 통계 및 리포트 (Statistics 도메인)

### 3.1 통계 타입 정의
- [ ] `src/types/statistics.ts` 생성
  - [ ] `MonthlySummary` 타입 정의
  - [ ] `YearlySummary` 타입 정의
  - [ ] `CategoryBreakdown` 타입 정의
  - [ ] `MonthlyTrend` 타입 정의

### 3.2 통계 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/StatisticsService.test.ts` 생성
  - [ ] `getMonthlySummary()` 테스트 케이스
  - [ ] `getYearlySummary()` 테스트 케이스
  - [ ] `getCategoryBreakdown()` 테스트 케이스
  - [ ] `getTrend()` 테스트 케이스
  - [ ] `getTopCategories()` 테스트 케이스

- [ ] **구현**: `src/services/StatisticsService.ts` 생성
  - [ ] `getMonthlySummary(year: number, month: number): Promise<MonthlySummary>`
  - [ ] `getYearlySummary(year: number): Promise<YearlySummary>`
  - [ ] `getCategoryBreakdown(start: string, end: string, type): Promise<CategoryBreakdown[]>`
  - [ ] `getTrend(months: number): Promise<MonthlyTrend[]>`
  - [ ] `getTopCategories(start: string, end: string, limit: number): Promise<CategorySummary[]>`

- [ ] **검증**: 모든 테스트 통과 확인

### 3.3 차트 컴포넌트 (TDD)
- [ ] 차트 라이브러리 설치 (react-native-chart-kit 또는 victory-native)

- [ ] **테스트 먼저**: `__tests__/components/charts/PieChart.test.tsx`
- [ ] **구현**: `src/views/components/charts/PieChart.tsx`

- [ ] **테스트 먼저**: `__tests__/components/charts/BarChart.test.tsx`
- [ ] **구현**: `src/views/components/charts/BarChart.tsx`

- [ ] **테스트 먼저**: `__tests__/components/charts/LineChart.test.tsx`
- [ ] **구현**: `src/views/components/charts/LineChart.tsx`

### 3.4 통계 스크린
- [ ] `src/views/screens/StatisticsScreen.tsx` 생성
  - [ ] 기간 선택 (월간/연간)
  - [ ] 요약 카드
  - [ ] 카테고리별 파이차트
  - [ ] 월별 추이 차트

### 3.5 네비게이션 확장
- [ ] Tab에 Statistics 탭 추가

### 3.6 API 문서화
- [ ] `docs/api/statistics-service.md` 생성
- [ ] `docs/api/examples/monthly-summary.json`
- [ ] `docs/api/examples/category-breakdown.json`

---

## 4. 정기 거래 자동 등록 (Recurring 도메인)

### 4.1 데이터 모델
- [ ] `src/types/recurring.ts` 생성
  - [ ] `RecurringTransaction` 인터페이스 정의
  - [ ] `CreateRecurringDTO`, `UpdateRecurringDTO` 타입 정의

### 4.2 정기 거래 서비스 (TDD)
- [ ] **인터페이스**: `src/services/interfaces/IRecurringService.ts` 생성
  - [ ] `getAll(): Promise<RecurringTransaction[]>`
  - [ ] `create(data: CreateRecurringDTO): Promise<RecurringTransaction>`
  - [ ] `update(id: string, data: UpdateRecurringDTO): Promise<RecurringTransaction>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `executeScheduled(): Promise<Transaction[]>`

- [ ] **테스트 먼저**: `__tests__/services/LocalRecurringService.test.ts` 생성
  - [ ] CRUD 테스트 케이스
  - [ ] 예정 거래 실행 테스트
  - [ ] 반복 주기 계산 테스트

- [ ] **구현**: `src/services/LocalRecurringService.ts` 구현

- [ ] **구현**: `src/services/GoogleSheetsRecurringService.ts` 구현

- [ ] **검증**: 모든 테스트 통과 확인

### 4.3 자동 실행 로직
- [ ] 앱 시작 시 예정된 정기 거래 체크
- [ ] 백그라운드 작업 스케줄링 (expo-background-fetch)

### 4.4 정기 거래 UI 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/recurring/RecurringForm.test.tsx`
- [ ] **구현**: `src/views/components/recurring/RecurringForm.tsx`

### 4.5 정기 거래 스크린
- [ ] `src/views/screens/RecurringScreen.tsx` 생성

### 4.6 API 문서화
- [ ] `docs/api/recurring-service.md` 생성
- [ ] `docs/api/examples/recurring-transaction.json`

---

## 5. 데이터 내보내기 (Export 도메인)

### 5.1 내보내기 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/ExportService.test.ts` 생성
  - [ ] CSV 생성 테스트
  - [ ] PDF 생성 테스트
  - [ ] 파일 포맷 정확성 테스트

- [ ] **구현**: `src/services/ExportService.ts` 생성
  - [ ] `exportToCSV(start: string, end: string): Promise<string>`
  - [ ] `exportToPDF(start: string, end: string): Promise<string>`
  - [ ] `shareFile(filePath: string): Promise<void>`

- [ ] **검증**: 모든 테스트 통과 확인

### 5.2 CSV 내보내기
- [ ] 거래 내역 CSV 포맷 정의
- [ ] CSV 생성 로직 구현
- [ ] 파일 저장 및 공유

### 5.3 PDF 리포트
- [ ] PDF 템플릿 디자인
- [ ] PDF 생성 (react-native-html-to-pdf)

### 5.4 내보내기 UI
- [ ] 설정 화면에 내보내기 섹션 추가

### 5.5 API 문서화
- [ ] `docs/api/export-service.md` 생성
- [ ] `docs/api/examples/csv-format.md`

---

## 6. 커스텀 카테고리 (Category 도메인)

### 6.1 카테고리 관리 서비스 (TDD)
- [ ] **인터페이스**: `src/services/interfaces/ICategoryService.ts` 생성
  - [ ] `getAll(): Promise<Category[]>`
  - [ ] `getByType(type: 'income' | 'expense'): Promise<Category[]>`
  - [ ] `create(data: CreateCategoryDTO): Promise<Category>`
  - [ ] `update(id: string, data: UpdateCategoryDTO): Promise<Category>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `reorder(ids: string[]): Promise<void>`

- [ ] **테스트 먼저**: `__tests__/services/LocalCategoryService.test.ts`

- [ ] **구현**: `src/services/LocalCategoryService.ts` 구현

- [ ] **구현**: `src/services/GoogleSheetsCategoryService.ts` 구현

- [ ] **검증**: 모든 테스트 통과 확인

### 6.2 카테고리 관리 UI 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/category/CategoryForm.test.tsx`
- [ ] **구현**: `src/views/components/category/CategoryForm.tsx`

### 6.3 카테고리 관리 스크린
- [ ] `src/views/screens/CategoryManageScreen.tsx` 생성
  - [ ] 드래그로 순서 변경
  - [ ] 기본 카테고리 복원

### 6.4 API 문서화
- [ ] `docs/api/category-service.md` 생성

---

## 7. UI/UX 개선

### 7.1 온보딩
- [ ] `src/views/screens/OnboardingScreen.tsx` 생성

### 7.2 검색 기능 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/SearchService.test.ts`
- [ ] **구현**: `src/services/SearchService.ts`
- [ ] `src/views/screens/SearchScreen.tsx` 생성

---

## 8. API 테스트 페이지 확장

### 8.1 Phase 3 API 테스트 추가
- [ ] `ApiTestScreen.tsx` 확장
  - [ ] Account API 테스트 섹션
  - [ ] Budget API 테스트 섹션
  - [ ] Statistics API 테스트 섹션
  - [ ] Recurring API 테스트 섹션
  - [ ] Export API 테스트 섹션

---

## 9. 의존성 추가

- [ ] 차트: `react-native-chart-kit` 또는 `victory-native`
- [ ] PDF: `react-native-html-to-pdf`
- [ ] 파일 공유: `expo-sharing`, `expo-file-system`
- [ ] 알림: `expo-notifications`
- [ ] 백그라운드: `expo-background-fetch`

---

## 10. 통합 테스트 및 검증

### 10.1 단위 테스트 커버리지 확인
- [ ] `npm run test:coverage` 실행
- [ ] Phase 3 관련 코드 커버리지 80% 이상 확인
- [ ] 서비스 레이어 90% 이상 확인

### 10.2 도메인별 테스트
- [ ] 자산 관리: 계좌 CRUD, 이체, 총 자산 계산
- [ ] 예산 관리: 예산 설정, 진행률 계산, 알림
- [ ] 통계: 차트 렌더링, 데이터 정확성
- [ ] 정기 거래: 자동 등록, 주기 계산
- [ ] 내보내기: CSV/PDF 생성

---

## 작업 순서 권장 (TDD 기반)

```
1단계: 자산 관리 (Account 도메인)
  ├── 타입 정의
  ├── IAccountService 인터페이스
  ├── LocalAccountService (테스트 → 구현 → 검증)
  ├── GoogleSheetsAccountService (테스트 → 구현 → 검증)
  ├── useAccounts (테스트 → 구현 → 검증)
  ├── UI 컴포넌트 (테스트 → 구현 → 검증)
  └── API 문서화

2단계: 예산 관리 (Budget 도메인)
  ├── 타입 정의
  ├── IBudgetService 인터페이스
  ├── 서비스 구현 (테스트 → 구현 → 검증)
  ├── UI 컴포넌트 (테스트 → 구현 → 검증)
  ├── 알림 서비스 (테스트 → 구현 → 검증)
  └── API 문서화

3단계: 통계 및 리포트 (Statistics 도메인)
  ├── 타입 정의
  ├── StatisticsService (테스트 → 구현 → 검증)
  ├── 차트 컴포넌트 (테스트 → 구현 → 검증)
  └── API 문서화

4단계: 정기 거래 (Recurring 도메인)
  ├── 타입 정의
  ├── IRecurringService 인터페이스
  ├── 서비스 구현 (테스트 → 구현 → 검증)
  └── API 문서화

5단계: 데이터 내보내기 (Export 도메인)
  ├── ExportService (테스트 → 구현 → 검증)
  └── API 문서화

6단계: 커스텀 카테고리 (Category 도메인)
  ├── ICategoryService 인터페이스
  ├── 서비스 구현 (테스트 → 구현 → 검증)
  └── API 문서화

7단계: UI/UX 개선
  └── 온보딩, 검색

8단계: API 테스트 페이지 확장

9단계: 통합 테스트 및 커버리지 확인
```

---

## 완료 기준

Phase 3는 다음 조건이 모두 충족되면 종료:

### 기능 요구사항
- [ ] 여러 계좌를 등록하고 관리할 수 있다
- [ ] 카테고리별 예산을 설정하고 진행 상황을 확인할 수 있다
- [ ] 통계 차트로 지출 패턴을 분석할 수 있다
- [ ] 정기 거래가 자동으로 등록된다
- [ ] 거래 내역을 CSV/PDF로 내보낼 수 있다
- [ ] 커스텀 카테고리를 만들 수 있다

### 품질 요구사항
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 모든 테스트 통과 (npm test)
- [ ] ESLint 에러 없음 (npm run lint)
- [ ] API 문서화 완료 (docs/api/)
- [ ] API 테스트 페이지 동작 (개발 환경)
