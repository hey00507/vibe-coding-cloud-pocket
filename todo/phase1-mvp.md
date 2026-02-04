# Phase 1: MVP 작업 목록

## 개요
기본 가계부 기능 구현 (지출/수익 기록, 로컬 저장)

### 개발 방법론
- **TDD (Test-Driven Development)**: 테스트 코드 먼저 작성 → 테스트 통과하는 코드 구현 → 리팩토링
- **도메인 단위 개발**: 기능을 도메인별로 분리하여 독립적으로 개발
- **인터페이스 기반 설계**: 서비스는 항상 인터페이스 먼저 정의

### TDD 작업 흐름
```
1. 테스트 파일 생성 (*.test.ts / *.spec.ts)
2. 실패하는 테스트 작성 (Red)
3. 테스트 통과하는 최소 구현 (Green)
4. 코드 정리 및 개선 (Refactor)
5. 다음 테스트 케이스로 반복
```

---

## 0. 테스트 환경 설정

### 0.1 테스트 프레임워크 설치
- [x] `jest` 설치 및 설정
- [x] `@testing-library/react-native` 설치
- [x] `@testing-library/jest-native` 설치 (deprecated - react-native v12.4+ 내장 사용)
- [x] `jest.config.js` 생성
- [x] `package.json`에 테스트 스크립트 추가
  - [x] `test` - 전체 테스트 실행
  - [x] `test:watch` - 감시 모드
  - [x] `test:coverage` - 커버리지 리포트

### 0.2 테스트 디렉토리 구조
```
__tests__/
├── utils/           # 유틸리티 함수 테스트
├── services/        # 서비스 레이어 테스트
├── controllers/     # 훅/컨트롤러 테스트
└── components/      # 컴포넌트 테스트
    ├── common/
    ├── calendar/
    ├── transaction/
    └── settings/
```

- [x] `__tests__/` 디렉토리 생성
- [x] `__tests__/utils/` 디렉토리 생성
- [x] `__tests__/services/` 디렉토리 생성
- [x] `__tests__/controllers/` 디렉토리 생성
- [x] `__tests__/components/` 디렉토리 생성
- [x] 테스트 헬퍼/목(mock) 설정 파일 생성

---

## 1. 기반 설정 (Foundation)

### 1.1 타입 정의
- [ ] `src/types/index.ts` 생성
  - [ ] `Transaction` 인터페이스 정의
  - [ ] `Category` 인터페이스 정의
  - [ ] `DailySummary` 인터페이스 정의
  - [ ] `CreateTransactionDTO` 타입 정의
  - [ ] `UpdateTransactionDTO` 타입 정의

### 1.2 모델 정의
- [ ] `src/models/index.ts` 생성
  - [ ] 타입 re-export
  - [ ] 타입 가드 함수 (isTransaction, isCategory 등)

### 1.3 상수 정의
- [ ] `src/constants/categories.ts` 생성
  - [ ] 수입 카테고리 배열 정의 (월급, 부수입, 용돈, 기타 수입)
  - [ ] 지출 카테고리 배열 정의 (식비, 교통비, 쇼핑, 문화/여가, 공과금, 의료/건강, 기타 지출)
  - [ ] 카테고리 아이콘 매핑
  - [ ] 카테고리 색상 매핑

- [ ] `src/constants/theme.ts` 생성
  - [ ] Light 테마 색상 정의
  - [ ] Dark 테마 색상 정의
  - [ ] 공통 스타일 상수 (spacing, fontSize, borderRadius 등)

### 1.4 유틸리티 함수 (TDD)

#### date.ts
- [ ] **테스트 먼저**: `__tests__/utils/date.test.ts` 생성
  - [ ] `formatDate` 테스트 케이스 작성
  - [ ] `formatTime` 테스트 케이스 작성
  - [ ] `formatDisplayDate` 테스트 케이스 작성
  - [ ] `getMonthDays` 테스트 케이스 작성
  - [ ] `getFirstDayOfMonth` 테스트 케이스 작성
  - [ ] `getDaysInMonth` 테스트 케이스 작성
  - [ ] `isSameDay` 테스트 케이스 작성
  - [ ] `parseDate` 테스트 케이스 작성
- [ ] **구현**: `src/utils/date.ts` 생성
  - [ ] `formatDate(date: Date): string` - ISO 형식 날짜 문자열
  - [ ] `formatTime(date: Date): string` - HH:mm 형식
  - [ ] `formatDisplayDate(date: string): string` - 표시용 (예: 2월 4일)
  - [ ] `getMonthDays(year: number, month: number): Date[]` - 월의 모든 날짜
  - [ ] `getFirstDayOfMonth(year: number, month: number): number` - 월 시작 요일
  - [ ] `getDaysInMonth(year: number, month: number): number` - 월 일수
  - [ ] `isSameDay(date1: Date, date2: Date): boolean`
  - [ ] `parseDate(dateString: string): Date`
- [ ] **검증**: 모든 테스트 통과 확인

#### format.ts
- [ ] **테스트 먼저**: `__tests__/utils/format.test.ts` 생성
  - [ ] `formatCurrency` 테스트 케이스 작성 (양수, 음수, 0, 큰 금액)
  - [ ] `formatSignedCurrency` 테스트 케이스 작성
- [ ] **구현**: `src/utils/format.ts` 생성
  - [ ] `formatCurrency(amount: number): string` - 금액 포맷 (예: 50,000원)
  - [ ] `formatSignedCurrency(amount: number, type: 'income' | 'expense'): string`
- [ ] **검증**: 모든 테스트 통과 확인

#### storage.ts
- [ ] **테스트 먼저**: `__tests__/utils/storage.test.ts` 생성
  - [ ] `getItem` 테스트 케이스 작성 (존재하는 키, 없는 키)
  - [ ] `setItem` 테스트 케이스 작성
  - [ ] `removeItem` 테스트 케이스 작성
  - [ ] `clear` 테스트 케이스 작성
- [ ] **구현**: `src/utils/storage.ts` 생성
  - [ ] AsyncStorage 래퍼 함수
  - [ ] `getItem<T>(key: string): Promise<T | null>`
  - [ ] `setItem<T>(key: string, value: T): Promise<void>`
  - [ ] `removeItem(key: string): Promise<void>`
  - [ ] `clear(): Promise<void>`
- [ ] **검증**: 모든 테스트 통과 확인

#### id.ts
- [ ] **테스트 먼저**: `__tests__/utils/id.test.ts` 생성
  - [ ] `generateId` 고유성 테스트
  - [ ] `generateId` 형식 테스트
- [ ] **구현**: `src/utils/id.ts` 생성
  - [ ] `generateId(): string` - UUID 생성
- [ ] **검증**: 모든 테스트 통과 확인

---

## 2. 서비스 레이어 (Transaction 도메인)

### 2.1 서비스 인터페이스
- [ ] `src/services/interfaces/ITransactionService.ts` 생성
  - [ ] `getAll(): Promise<Transaction[]>`
  - [ ] `getByDateRange(start: string, end: string): Promise<Transaction[]>`
  - [ ] `getById(id: string): Promise<Transaction | null>`
  - [ ] `create(data: CreateTransactionDTO): Promise<Transaction>`
  - [ ] `update(id: string, data: UpdateTransactionDTO): Promise<Transaction>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `getDailySummary(date: string): Promise<DailySummary>`
  - [ ] `getMonthlySummary(year: number, month: number): Promise<DailySummary[]>`

### 2.2 로컬 저장소 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/LocalTransactionService.test.ts` 생성
  - [ ] `getAll()` 테스트 케이스
    - [ ] 빈 목록 반환
    - [ ] 저장된 거래 목록 반환
  - [ ] `getByDateRange()` 테스트 케이스
    - [ ] 범위 내 거래만 반환
    - [ ] 경계값 테스트
  - [ ] `getById()` 테스트 케이스
    - [ ] 존재하는 ID
    - [ ] 존재하지 않는 ID (null 반환)
  - [ ] `create()` 테스트 케이스
    - [ ] 정상 생성
    - [ ] id, createdAt, updatedAt 자동 생성 확인
  - [ ] `update()` 테스트 케이스
    - [ ] 정상 수정
    - [ ] updatedAt 갱신 확인
    - [ ] 존재하지 않는 ID 에러
  - [ ] `delete()` 테스트 케이스
    - [ ] 정상 삭제
    - [ ] 존재하지 않는 ID 에러
  - [ ] `getDailySummary()` 테스트 케이스
    - [ ] 일일 합계 계산 정확성
    - [ ] 거래 없는 날짜
  - [ ] `getMonthlySummary()` 테스트 케이스
    - [ ] 월별 요약 정확성
    - [ ] 거래 없는 월

- [ ] **구현**: `src/services/LocalTransactionService.ts` 생성
  - [ ] 클래스 구조 설정
  - [ ] `getAll()` 구현
  - [ ] `getByDateRange()` 구현
  - [ ] `getById()` 구현
  - [ ] `create()` 구현 (id, createdAt, updatedAt 자동 생성)
  - [ ] `update()` 구현 (updatedAt 자동 갱신)
  - [ ] `delete()` 구현
  - [ ] `getDailySummary()` 구현
  - [ ] `getMonthlySummary()` 구현
  - [ ] 내부 헬퍼: `_loadTransactions()`, `_saveTransactions()`

- [ ] **검증**: 모든 테스트 통과 확인 (커버리지 80% 이상)

### 2.3 서비스 팩토리
- [ ] `src/services/index.ts` 생성
  - [ ] `getTransactionService(): ITransactionService`
  - [ ] 현재는 LocalTransactionService 반환

### 2.4 서비스 API 문서화
- [ ] `docs/api/transaction-service.md` 생성
  - [ ] 인터페이스 설명
  - [ ] 각 메서드 설명
  - [ ] 파라미터 및 반환값
  - [ ] 에러 케이스
- [ ] `docs/api/examples/` 디렉토리 생성
  - [ ] `transaction-create.json` - 생성 요청 예시
  - [ ] `transaction-response.json` - 응답 예시
  - [ ] `daily-summary.json` - 일일 요약 예시

---

## 3. 테마 시스템 (Theme 도메인)

### 3.1 테마 Context (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/ThemeContext.test.tsx` 생성
  - [ ] 기본 테마 적용 테스트
  - [ ] 테마 변경 테스트
  - [ ] 시스템 테마 연동 테스트
- [ ] **구현**: `src/controllers/ThemeContext.tsx` 생성
  - [ ] `ThemeContext` 생성
  - [ ] `ThemeProvider` 컴포넌트
  - [ ] 테마 상태 관리 (light/dark/system)
  - [ ] 시스템 테마 감지 (useColorScheme)
- [ ] **검증**: 모든 테스트 통과 확인

### 3.2 테마 훅 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useTheme.test.ts` 생성
  - [ ] `useTheme()` 반환값 테스트
  - [ ] `useThemeMode()` 반환값 및 변경 함수 테스트
- [ ] **구현**: `src/controllers/useTheme.ts` 생성
  - [ ] `useTheme()` 훅 - 현재 테마 객체 반환
  - [ ] `useThemeMode()` 훅 - 테마 모드 및 변경 함수 반환
- [ ] **검증**: 모든 테스트 통과 확인

---

## 4. 네비게이션 설정 (Navigation 도메인)

### 4.1 네비게이션 타입
- [ ] `src/types/navigation.ts` 생성
  - [ ] `RootTabParamList` 정의
  - [ ] `RootStackParamList` 정의
  - [ ] 네비게이션 prop 타입 정의

### 4.2 네비게이션 구성
- [ ] `src/navigation/TabNavigator.tsx` 생성
  - [ ] Bottom Tab Navigator 설정
  - [ ] Calendar 탭
  - [ ] List 탭
  - [ ] Settings 탭
  - [ ] 탭 아이콘 설정
  - [ ] 탭 바 스타일링 (테마 적용)

- [ ] `src/navigation/RootNavigator.tsx` 생성
  - [ ] Stack Navigator 설정
  - [ ] TabNavigator를 메인으로
  - [ ] TransactionDetail 스크린
  - [ ] AddTransaction 스크린

- [ ] `src/navigation/index.ts` 생성
  - [ ] NavigationContainer 래퍼

---

## 5. 공통 UI 컴포넌트 (Common 도메인)

### 5.1 Button 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/common/Button.test.tsx` 생성
  - [ ] 렌더링 테스트
  - [ ] onPress 이벤트 테스트
  - [ ] disabled 상태 테스트
  - [ ] loading 상태 테스트
  - [ ] variant별 스타일 테스트
- [ ] **구현**: `src/views/components/common/Button.tsx` 생성
  - [ ] Props 인터페이스 정의 (title, onPress, variant, disabled, loading)
  - [ ] Primary 버튼 스타일
  - [ ] Secondary 버튼 스타일
  - [ ] Outline 버튼 스타일
  - [ ] 비활성화 상태 스타일
  - [ ] 로딩 상태 (ActivityIndicator)
  - [ ] 테마 적용
- [ ] **검증**: 모든 테스트 통과 확인

### 5.2 Card 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/common/Card.test.tsx` 생성
  - [ ] 렌더링 테스트
  - [ ] children 렌더링 테스트
  - [ ] onPress 이벤트 테스트 (터치 가능 시)
- [ ] **구현**: `src/views/components/common/Card.tsx` 생성
  - [ ] Props 인터페이스 정의 (children, style, onPress)
  - [ ] 기본 카드 스타일 (그림자, 둥근 모서리)
  - [ ] 터치 가능한 카드 옵션
  - [ ] 테마 적용
- [ ] **검증**: 모든 테스트 통과 확인

### 5.3 Input 컴포넌트 (TDD)
- [ ] **테스트 먼저**: `__tests__/components/common/Input.test.tsx` 생성
  - [ ] 렌더링 테스트
  - [ ] 레이블 표시 테스트
  - [ ] onChangeText 이벤트 테스트
  - [ ] 에러 메시지 표시 테스트
- [ ] **구현**: `src/views/components/common/Input.tsx` 생성
  - [ ] Props 인터페이스 정의 (label, value, onChangeText, placeholder, error, keyboardType)
  - [ ] 레이블 표시
  - [ ] 입력 필드 스타일
  - [ ] 에러 메시지 표시
  - [ ] 포커스 상태 스타일
  - [ ] 테마 적용
- [ ] **검증**: 모든 테스트 통과 확인

### 5.4 공통 컴포넌트 인덱스
- [ ] `src/views/components/common/index.ts` 생성
  - [ ] 모든 공통 컴포넌트 re-export

---

## 6. 거래 컨트롤러 (Transaction Controller)

### 6.1 useTransactions 훅 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useTransactions.test.ts` 생성
  - [ ] 초기 상태 테스트
  - [ ] `fetchTransactions` 테스트
  - [ ] `fetchMonthlySummary` 테스트
  - [ ] `createTransaction` 테스트
  - [ ] `updateTransaction` 테스트
  - [ ] `deleteTransaction` 테스트
  - [ ] 로딩 상태 테스트
  - [ ] 에러 상태 테스트
- [ ] **구현**: `src/controllers/useTransactions.ts` 생성
  - [ ] 거래 목록 상태 관리
  - [ ] `fetchTransactions(start: string, end: string)` 함수
  - [ ] `fetchMonthlySummary(year: number, month: number)` 함수
  - [ ] `createTransaction(data: CreateTransactionDTO)` 함수
  - [ ] `updateTransaction(id: string, data: UpdateTransactionDTO)` 함수
  - [ ] `deleteTransaction(id: string)` 함수
  - [ ] 로딩 상태 관리
  - [ ] 에러 상태 관리
- [ ] **검증**: 모든 테스트 통과 확인

---

## 7. 캘린더 뷰 (Calendar 도메인)

### 7.1 캘린더 컨트롤러 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useCalendar.test.ts` 생성
  - [ ] 초기 상태 (현재 연/월) 테스트
  - [ ] `goToPrevMonth` 테스트 (12월 → 11월, 1월 → 전년 12월)
  - [ ] `goToNextMonth` 테스트 (12월 → 다음년 1월)
  - [ ] `goToToday` 테스트
  - [ ] `selectDate` 테스트
- [ ] **구현**: `src/controllers/useCalendar.ts` 생성
  - [ ] 현재 연/월 상태 관리
  - [ ] `goToPrevMonth()` 함수
  - [ ] `goToNextMonth()` 함수
  - [ ] `goToToday()` 함수
  - [ ] `selectDate(date: string)` 함수
  - [ ] 선택된 날짜 상태
- [ ] **검증**: 모든 테스트 통과 확인

### 7.2 캘린더 컴포넌트 (TDD)

#### CalendarHeader
- [ ] **테스트 먼저**: `__tests__/components/calendar/CalendarHeader.test.tsx` 생성
- [ ] **구현**: `src/views/components/calendar/CalendarHeader.tsx` 생성
  - [ ] Props 정의 (year, month, onPrev, onNext)
  - [ ] 연도/월 표시 (예: 2026년 2월)
  - [ ] 이전/다음 월 버튼
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### WeekdayHeader
- [ ] **테스트 먼저**: `__tests__/components/calendar/WeekdayHeader.test.tsx` 생성
- [ ] **구현**: `src/views/components/calendar/WeekdayHeader.tsx` 생성
  - [ ] 요일 표시 (일 월 화 수 목 금 토)
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### DayCell
- [ ] **테스트 먼저**: `__tests__/components/calendar/DayCell.test.tsx` 생성
  - [ ] 날짜 표시 테스트
  - [ ] 양수 잔액 스타일 테스트
  - [ ] 음수 잔액 스타일 테스트
  - [ ] 오늘 날짜 하이라이트 테스트
  - [ ] 선택 상태 테스트
- [ ] **구현**: `src/views/components/calendar/DayCell.tsx` 생성
  - [ ] Props 정의 (date, balance, isToday, isSelected, onPress)
  - [ ] 날짜 숫자 표시
  - [ ] 일일 잔액 표시 (양수: 초록, 음수: 빨강)
  - [ ] 오늘/선택 하이라이트
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### CalendarGrid
- [ ] **테스트 먼저**: `__tests__/components/calendar/CalendarGrid.test.tsx` 생성
- [ ] **구현**: `src/views/components/calendar/CalendarGrid.tsx` 생성
  - [ ] Props 정의 (year, month, dailySummaries, selectedDate, onSelectDate)
  - [ ] 6x7 그리드 레이아웃
  - [ ] 이전/다음 달 날짜 채우기
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### SelectedDayTransactions
- [ ] **테스트 먼저**: `__tests__/components/calendar/SelectedDayTransactions.test.tsx` 생성
- [ ] **구현**: `src/views/components/calendar/SelectedDayTransactions.tsx` 생성
  - [ ] Props 정의 (date, transactions)
  - [ ] 거래 목록 표시
  - [ ] 빈 상태 표시
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

### 7.3 캘린더 스크린
- [ ] `src/views/screens/CalendarScreen.tsx` 생성
  - [ ] useCalendar 훅 연동
  - [ ] useTransactions 훅 연동
  - [ ] 모든 캘린더 컴포넌트 조합
  - [ ] 거래 추가 FAB 버튼
  - [ ] 테마 적용

### 7.4 캘린더 컴포넌트 인덱스
- [ ] `src/views/components/calendar/index.ts` 생성

---

## 8. 리스트 뷰 (List 도메인)

### 8.1 리스트 컴포넌트 (TDD)

#### TransactionItem
- [ ] **테스트 먼저**: `__tests__/components/transaction/TransactionItem.test.tsx` 생성
  - [ ] 수입 거래 렌더링 테스트
  - [ ] 지출 거래 렌더링 테스트
  - [ ] onPress 이벤트 테스트
- [ ] **구현**: `src/views/components/transaction/TransactionItem.tsx` 생성
  - [ ] Props 정의 (transaction, onPress)
  - [ ] 시간, 카테고리, 금액, 메모 표시
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### DailyGroup
- [ ] **테스트 먼저**: `__tests__/components/transaction/DailyGroup.test.tsx` 생성
- [ ] **구현**: `src/views/components/transaction/DailyGroup.tsx` 생성
  - [ ] Props 정의 (date, transactions, dailyBalance)
  - [ ] 날짜 헤더 및 일일 잔액
  - [ ] TransactionItem 목록
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### TransactionList
- [ ] **테스트 먼저**: `__tests__/components/transaction/TransactionList.test.tsx` 생성
- [ ] **구현**: `src/views/components/transaction/TransactionList.tsx` 생성
  - [ ] Props 정의 (dailySummaries, onTransactionPress)
  - [ ] FlatList/SectionList 사용
  - [ ] 빈 상태 표시
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### MonthSelector
- [ ] **테스트 먼저**: `__tests__/components/transaction/MonthSelector.test.tsx` 생성
- [ ] **구현**: `src/views/components/transaction/MonthSelector.tsx` 생성
  - [ ] Props 정의 (year, month, onPrev, onNext)
  - [ ] 연도/월 표시 및 버튼
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

### 8.2 리스트 스크린
- [ ] `src/views/screens/ListScreen.tsx` 생성
  - [ ] useTransactions 훅 연동
  - [ ] 월 네비게이션 상태
  - [ ] 모든 리스트 컴포넌트 조합
  - [ ] 거래 추가 FAB 버튼
  - [ ] 테마 적용

### 8.3 거래 컴포넌트 인덱스
- [ ] `src/views/components/transaction/index.ts` 생성

---

## 9. 거래 CRUD (Transaction Form 도메인)

### 9.1 거래 폼 컴포넌트 (TDD)

#### CategoryPicker
- [ ] **테스트 먼저**: `__tests__/components/transaction/CategoryPicker.test.tsx` 생성
  - [ ] 수입 카테고리 필터링 테스트
  - [ ] 지출 카테고리 필터링 테스트
  - [ ] 선택 이벤트 테스트
- [ ] **구현**: `src/views/components/transaction/CategoryPicker.tsx` 생성
  - [ ] Props 정의 (type, selectedId, onSelect)
  - [ ] 그리드 레이아웃
  - [ ] 선택 하이라이트
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### TransactionForm
- [ ] **테스트 먼저**: `__tests__/components/transaction/TransactionForm.test.tsx` 생성
  - [ ] 초기 렌더링 테스트
  - [ ] 수입/지출 전환 테스트
  - [ ] 폼 유효성 검사 테스트
  - [ ] onSubmit 이벤트 테스트
- [ ] **구현**: `src/views/components/transaction/TransactionForm.tsx` 생성
  - [ ] Props 정의 (initialData, onSubmit, onCancel)
  - [ ] 거래 유형 선택
  - [ ] 금액 입력
  - [ ] 카테고리 선택
  - [ ] 날짜/시간 선택
  - [ ] 메모 입력
  - [ ] 폼 유효성 검사
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

### 9.2 거래 스크린

#### AddTransactionScreen
- [ ] `src/views/screens/AddTransactionScreen.tsx` 생성
  - [ ] 네비게이션 헤더
  - [ ] TransactionForm 배치
  - [ ] createTransaction 연동
  - [ ] 성공 시 뒤로가기
  - [ ] 에러 처리
  - [ ] 테마 적용

#### TransactionDetailScreen
- [ ] `src/views/screens/TransactionDetailScreen.tsx` 생성
  - [ ] 라우트 파라미터 처리
  - [ ] 거래 데이터 로드
  - [ ] TransactionForm (수정 모드)
  - [ ] 삭제 버튼 및 확인 Alert
  - [ ] updateTransaction, deleteTransaction 연동
  - [ ] 테마 적용

---

## 10. 설정 화면 (Settings 도메인)

### 10.1 설정 컴포넌트 (TDD)

#### SettingItem
- [ ] **테스트 먼저**: `__tests__/components/settings/SettingItem.test.tsx` 생성
- [ ] **구현**: `src/views/components/settings/SettingItem.tsx` 생성
  - [ ] Props 정의 (icon, title, subtitle, onPress, rightElement)
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

#### SettingSection
- [ ] **테스트 먼저**: `__tests__/components/settings/SettingSection.test.tsx` 생성
- [ ] **구현**: `src/views/components/settings/SettingSection.tsx` 생성
  - [ ] Props 정의 (title, children)
  - [ ] 테마 적용
- [ ] **검증**: 테스트 통과 확인

### 10.2 설정 스크린
- [ ] `src/views/screens/SettingsScreen.tsx` 생성
  - [ ] 테마 설정 섹션 (Light/Dark/System)
  - [ ] 앱 정보 섹션
  - [ ] (Phase 2 준비) Google 계정 연동 placeholder
  - [ ] 테마 적용

### 10.3 설정 컴포넌트 인덱스
- [ ] `src/views/components/settings/index.ts` 생성

---

## 11. 앱 진입점

### 11.1 App 컴포넌트
- [ ] `App.tsx` 수정
  - [ ] ThemeProvider 래핑
  - [ ] NavigationContainer 래핑
  - [ ] RootNavigator 렌더링
  - [ ] StatusBar 설정

### 11.2 의존성 설치
- [ ] `@react-navigation/native` 설치
- [ ] `@react-navigation/bottom-tabs` 설치
- [ ] `@react-navigation/native-stack` 설치
- [ ] `react-native-screens` 설치
- [ ] `react-native-safe-area-context` 설치
- [ ] `@react-native-async-storage/async-storage` 설치
- [ ] `date-fns` 설치
- [ ] `uuid` 또는 `nanoid` 설치
- [ ] `jest` 설치
- [ ] `@testing-library/react-native` 설치

---

## 12. 통합 테스트 및 검증

### 12.1 단위 테스트 커버리지 확인
- [ ] `npm run test:coverage` 실행
- [ ] 전체 커버리지 80% 이상 확인
- [ ] 주요 서비스/유틸리티 90% 이상 확인

### 12.2 E2E 기능 테스트
- [ ] 거래 추가 테스트 (수입/지출)
- [ ] 거래 수정 테스트
- [ ] 거래 삭제 테스트
- [ ] 캘린더 뷰에서 일일 잔액 표시 확인
- [ ] 리스트 뷰에서 일별 그룹핑 확인
- [ ] 앱 재시작 후 데이터 유지 확인
- [ ] 테마 변경 테스트 (Light/Dark)

### 12.3 엣지 케이스
- [ ] 거래 0개인 상태 표시
- [ ] 매우 큰 금액 표시
- [ ] 긴 메모 처리
- [ ] 월 경계 이동 (12월 → 1월)

---

## 작업 순서 권장 (TDD 기반)

```
0단계: 테스트 환경 설정
  └── Jest, Testing Library 설치 및 설정

1단계: 기반 설정
  ├── 타입/상수 정의 (테스트 불필요)
  └── 유틸리티 함수 (테스트 → 구현 → 검증)

2단계: 서비스 레이어
  ├── 인터페이스 정의
  ├── LocalTransactionService (테스트 → 구현 → 검증)
  └── API 문서화

3단계: 테마 시스템
  └── Context/Hook (테스트 → 구현 → 검증)

4단계: 네비게이션 설정

5단계: 공통 UI 컴포넌트
  └── Button/Card/Input (테스트 → 구현 → 검증)

6단계: 거래 컨트롤러
  └── useTransactions (테스트 → 구현 → 검증)

7단계: 캘린더 뷰
  ├── useCalendar (테스트 → 구현 → 검증)
  ├── 캘린더 컴포넌트들 (테스트 → 구현 → 검증)
  └── CalendarScreen

8단계: 리스트 뷰
  ├── 리스트 컴포넌트들 (테스트 → 구현 → 검증)
  └── ListScreen

9단계: 거래 CRUD
  ├── 폼 컴포넌트들 (테스트 → 구현 → 검증)
  └── Add/Detail 스크린

10단계: 설정 화면

11단계: 앱 통합

12단계: 통합 테스트 및 커버리지 확인
```

---

## 완료 기준

Phase 1 MVP는 다음 조건이 모두 충족되면 종료:

### 기능 요구사항
- [ ] 수입/지출 거래를 추가, 수정, 삭제할 수 있다
- [ ] 캘린더 뷰에서 월별 일일 잔액을 확인할 수 있다
- [ ] 리스트 뷰에서 일별 거래 내역을 확인할 수 있다
- [ ] 앱을 종료해도 데이터가 유지된다
- [ ] Light/Dark 테마를 변경할 수 있다

### 품질 요구사항
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 모든 테스트 통과 (npm test)
- [ ] ESLint 에러 없음 (npm run lint)
- [ ] 서비스 API 문서화 완료
