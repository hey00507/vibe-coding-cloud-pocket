# PRD: Google Sheets 동기화 (Phase 3)

> 작성일: 2026-03-13
> 상태: 🔴 미착수
> 참고: [data-architecture.md](data-architecture.md), [google-sheets-schema.md](google-sheets-schema.md)

---

## 1. 목표

로컬(AsyncStorage) 데이터를 Google Sheets로 **수동 백업/복원**하여 데이터 안전성 확보 및 엑셀에서 대량 편집 가능하게 함.

### 핵심 요구사항
1. Google OAuth 인증 (Expo AuthSession)
2. 내보내기: 로컬 → Google Sheets (전체 덮어쓰기)
3. 가져오기: Google Sheets → 로컬 (전체 덮어쓰기)
4. 설정 화면에 백업/복원 UI
5. 단일 기기 전제, 양방향 병합 없음

### 제약사항
- Google Sheets API: 60회/분/사용자 → 수동 동기화만
- 개인 사용 앱 → OAuth 앱 심사 불필요 (테스트 모드)

---

## 2. 아키텍처

### 2.1 전체 흐름

```
┌──────────────────────────┐
│  AsyncStorage (주 저장소)  │
│  - 모든 CRUD 여기서 처리   │
└──────────┬───────────────┘
           │ [수동 백업/복원]
┌──────────▼───────────────┐
│  Google Sheets (백업용)    │
│  - 내보내기: 로컬 → 시트   │
│  - 가져오기: 시트 → 로컬   │
└──────────────────────────┘
```

### 2.2 파일 구조

```
신규 파일:
  src/services/interfaces/IGoogleSheetsService.ts  # 인터페이스
  src/services/GoogleSheetsService.ts              # 구현
  src/services/GoogleAuthService.ts                # OAuth 인증
  src/types/googleSheets.ts                        # 관련 타입
  src/views/components/BackupRestoreSection.tsx     # 설정 UI 컴포넌트
  src/constants/googleSheets.ts                    # 시트명, 셀 범위 상수
  __tests__/services/GoogleSheetsService.test.ts   # 테스트
  __tests__/services/GoogleAuthService.test.ts     # 테스트
  __tests__/components/BackupRestoreSection.test.tsx # 테스트

수정 파일:
  src/constants/storageKeys.ts     # Google auth token 키 추가
  src/services/ServiceRegistry.ts  # GoogleSheetsService 등록
  src/views/screens/SettingsScreen.tsx  # 백업/복원 UI 추가
  app.json / app.config.js        # OAuth scheme 설정
```

---

## 3. 구현 단계 (Step-by-Step)

---

### Step 1: Google Cloud 프로젝트 설정

**작업 내용 (수동):**
1. Google Cloud Console에서 기존 프로젝트 사용 또는 신규 생성
2. Google Sheets API 활성화
3. OAuth 2.0 클라이언트 ID 생성 (iOS 타입)
   - Bundle ID: Expo app.json의 `ios.bundleIdentifier`
4. OAuth 동의 화면 설정 (테스트 모드, 본인 계정만)
5. Scopes: `https://www.googleapis.com/auth/spreadsheets`

**완료 기준:**
- [ ] Sheets API 활성화
- [ ] OAuth Client ID 발급
- [ ] 동의 화면 설정 (테스트 모드)

---

### Step 2: 패키지 설치 및 Expo 설정

**작업 내용:**
```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

**파일: `app.json` 또는 `app.config.js` (수정)**
```json
{
  "expo": {
    "scheme": "cloudpocket",
    "ios": {
      "bundleIdentifier": "com.ethankim.cloudpocket"
    }
  }
}
```

**완료 기준:**
- [ ] 패키지 설치
- [ ] scheme, bundleIdentifier 설정
- [ ] `npm test` 통과 (기존 테스트 깨지지 않음)

---

### Step 3: 타입 정의

**파일:** `src/types/googleSheets.ts` (신규)

```typescript
// Google Auth 관련
export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp
}

// 동기화 상태
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
  recordCounts?: {
    transactions: number;
    categories: number;
    subCategories: number;
    paymentMethods: number;
    incomeTargets: number;
    savings: number;
    bankAccounts: number;
  };
}

// 시트 데이터 행
export interface SheetRow {
  values: (string | number | null)[];
}
```

**완료 기준:**
- [ ] 타입 파일 생성
- [ ] 컴파일 에러 없음

---

### Step 4: 상수 정의

**파일:** `src/constants/googleSheets.ts` (신규)

```typescript
// 시트명
export const SHEET_NAMES = {
  SETTINGS: '(필수)설정 시트',
  YEAR_SUMMARY: '2026',
  MONTHS: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
} as const;

// 셀 범위 (google-sheets-schema.md 기반)
export const CELL_RANGES = {
  // 설정 시트
  CATEGORIES: "'(필수)설정 시트'!D40:M51",
  PAYMENT_METHODS: "'(필수)설정 시트'!B11:C21",
  INCOME_CATEGORIES: "'(필수)설정 시트'!B25:B29",
  SAVINGS_PRODUCTS: "'(필수)설정 시트'!D4:N16",
  BANK_ACCOUNTS: "'(필수)설정 시트'!B18:B21",

  // 월별 시트 (동적: month 파라미터)
  EXPENSE_TRANSACTIONS: (month: string) => `'${month}'!F6:K1000`,
  INCOME_DETAILS: (month: string) => `'${month}'!B15:D19`,
  SAVINGS_DETAILS: (month: string) => `'${month}'!B22:D33`,
} as const;
```

**파일:** `src/constants/storageKeys.ts` (수정)

```typescript
// 추가
GOOGLE_AUTH_TOKENS: '@cloudpocket/googleAuthTokens',
LAST_SYNC: '@cloudpocket/lastSync',
SPREADSHEET_ID: '@cloudpocket/spreadsheetId',
```

**완료 기준:**
- [ ] 시트명, 셀 범위 상수 정의
- [ ] storageKeys 추가

---

### Step 5: GoogleAuthService 구현

**파일:** `src/services/GoogleAuthService.ts` (신규)

**인터페이스:**
```typescript
interface IGoogleAuthService {
  signIn(): Promise<GoogleAuthTokens>;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  isSignedIn(): boolean;
  refreshTokenIfNeeded(): Promise<string>;
}
```

**상세 구현:**
1. `signIn()`:
   - `expo-auth-session`의 `useAuthRequest` 사용
   - Google OAuth 엔드포인트로 인증 요청
   - 토큰 받아서 AsyncStorage에 저장
   - `accessToken`, `refreshToken`, `expiresAt` 반환

2. `signOut()`:
   - AsyncStorage에서 토큰 삭제
   - 상태 초기화

3. `getAccessToken()`:
   - 저장된 토큰 로드
   - 만료 확인 → 만료 시 refresh
   - 유효한 accessToken 반환

4. `refreshTokenIfNeeded()`:
   - `expiresAt < Date.now()` 확인
   - Google token endpoint로 refresh 요청
   - 새 토큰 저장 및 반환

**테스트 케이스 (8개):**

| # | 테스트명 |
|---|---------|
| 1 | signIn 성공 시 토큰 반환 |
| 2 | signIn 실패 시 에러 throw |
| 3 | signOut 후 isSignedIn() === false |
| 4 | getAccessToken — 유효한 토큰 반환 |
| 5 | getAccessToken — 토큰 없으면 null 반환 |
| 6 | getAccessToken — 만료된 토큰이면 자동 refresh |
| 7 | refreshTokenIfNeeded — 토큰 갱신 성공 |
| 8 | refreshTokenIfNeeded — 갱신 실패 시 에러 |

**완료 기준:**
- [ ] GoogleAuthService 구현
- [ ] 8개 테스트 통과
- [ ] AsyncStorage mock 사용

---

### Step 6: IGoogleSheetsService 인터페이스 정의

**파일:** `src/services/interfaces/IGoogleSheetsService.ts` (신규)

```typescript
export interface IGoogleSheetsService {
  // 스프레드시트 설정
  setSpreadsheetId(id: string): void;
  getSpreadsheetId(): string | null;

  // 내보내기 (로컬 → 시트)
  exportAll(): Promise<SyncResult>;
  exportTransactions(year: number, month: number): Promise<SyncResult>;
  exportSettings(): Promise<SyncResult>;

  // 가져오기 (시트 → 로컬)
  importAll(): Promise<SyncResult>;
  importTransactions(year: number, month: number): Promise<SyncResult>;
  importSettings(): Promise<SyncResult>;

  // 유틸
  getLastSyncTime(): Date | null;
  testConnection(): Promise<boolean>;
}
```

**완료 기준:**
- [ ] 인터페이스 파일 생성
- [ ] 메서드 시그니처 확정

---

### Step 7: GoogleSheetsService 구현 — 기본 API 호출

**파일:** `src/services/GoogleSheetsService.ts` (신규)

**내부 헬퍼 메서드:**
```typescript
// Google Sheets API v4 REST 호출
private async readRange(range: string): Promise<SheetRow[]>;
private async writeRange(range: string, values: (string|number|null)[][]): Promise<void>;
private async clearRange(range: string): Promise<void>;
private async batchUpdate(requests: BatchRequest[]): Promise<void>;
```

**API 호출 방식:**
- `fetch()` 직접 사용 (추가 SDK 불필요)
- Base URL: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}`
- GET `/values/{range}` — 읽기
- PUT `/values/{range}?valueInputOption=USER_ENTERED` — 쓰기
- POST `/values/{range}:clear` — 지우기
- Authorization: `Bearer {accessToken}`

**테스트 케이스 (6개):**

| # | 테스트명 |
|---|---------|
| 1 | readRange — 정상 데이터 반환 |
| 2 | readRange — 빈 시트 빈 배열 반환 |
| 3 | writeRange — 데이터 쓰기 성공 |
| 4 | clearRange — 범위 클리어 성공 |
| 5 | API 호출 시 accessToken 헤더 포함 |
| 6 | 401 에러 시 토큰 refresh 후 재시도 |

**완료 기준:**
- [ ] 기본 CRUD 헬퍼 구현
- [ ] fetch mock으로 6개 테스트 통과

---

### Step 8: GoogleSheetsService 구현 — 내보내기

**exportAll() 흐름:**
```
1. 인증 확인 (accessToken 유효?)
2. 설정 데이터 내보내기 (exportSettings)
3. 12개월 거래 데이터 내보내기 (exportTransactions × 12)
4. lastSync 저장
5. SyncResult 반환
```

**exportTransactions(year, month) 상세:**
```
1. transactionService.getByDateRange(month 시작일, month 종료일)
2. 지출 거래만 필터 (type === 'expense')
3. 앱 데이터 → 시트 행 변환:
   - date → 일자 숫자 (day만)
   - categoryId → category.name (대분류)
   - subCategoryId → icon + name (소분류)
   - amount → 금액
   - paymentMethodId → paymentMethod.name
   - memo → 세부사항
4. 해당 월 시트 기존 데이터 clear
5. 변환된 행 write

수입 거래:
1. type === 'income' 필터
2. 카테고리별 합산
3. 수입 영역(B15:D19)에 write
```

**exportSettings() 상세:**
```
1. 카테고리/소분류 → 설정 시트 대분류/소분류 매트릭스 변환
2. 결제수단 → 설정 시트 결제수단 영역
3. 저축 상품 → 설정 시트 저축 영역
4. 은행 계좌 → 설정 시트 계좌 영역
```

**테스트 케이스 (8개):**

| # | 테스트명 |
|---|---------|
| 1 | exportAll — 전체 내보내기 성공 |
| 2 | exportTransactions — 지출 거래 올바른 행 변환 |
| 3 | exportTransactions — categoryId → name 변환 |
| 4 | exportTransactions — 수입 거래 카테고리별 합산 |
| 5 | exportTransactions — 빈 월 처리 |
| 6 | exportSettings — 카테고리 매트릭스 변환 |
| 7 | exportSettings — 결제수단 변환 |
| 8 | exportAll — 인증 없으면 에러 |

**완료 기준:**
- [ ] exportAll, exportTransactions, exportSettings 구현
- [ ] 8개 테스트 통과

---

### Step 9: GoogleSheetsService 구현 — 가져오기

**importAll() 흐름:**
```
1. 인증 확인
2. 설정 데이터 가져오기 (importSettings)
3. 12개월 거래 데이터 가져오기 (importTransactions × 12)
4. lastSync 저장
5. SyncResult 반환
```

**importTransactions(year, month) 상세:**
```
1. 월별 시트에서 지출 데이터 read (F6:K1000)
2. 빈 행 필터
3. 시트 행 → 앱 데이터 변환:
   - 일자 숫자 → Date 객체 (year, month, day)
   - 대분류 이름 → categoryId (매칭, 없으면 생성)
   - 소분류 이름 → subCategoryId (이모지 제거 후 매칭)
   - 결제수단 이름 → paymentMethodId (매칭, 없으면 생성)
4. 해당 월 기존 거래 삭제
5. 변환된 거래 create

수입:
1. 수입 영역 read (B15:D19)
2. 카테고리별 합계 → 개별 거래로 변환
```

**importSettings() 상세:**
```
1. 카테고리 매트릭스 read → Category + SubCategory 생성
2. 결제수단 read → PaymentMethod 생성
3. 저축 상품 read → SavingsProduct 생성
4. 은행 계좌 read → BankAccount 생성
5. 기존 데이터 clear 후 import
```

**테스트 케이스 (8개):**

| # | 테스트명 |
|---|---------|
| 1 | importAll — 전체 가져오기 성공 |
| 2 | importTransactions — 시트 행 → Transaction 변환 |
| 3 | importTransactions — 대분류 이름 → categoryId 매칭 |
| 4 | importTransactions — 없는 카테고리 자동 생성 |
| 5 | importTransactions — 이모지 포함 소분류 파싱 |
| 6 | importSettings — 카테고리 매트릭스 파싱 |
| 7 | importSettings — 저축 상품 파싱 |
| 8 | importAll — 인증 없으면 에러 |

**완료 기준:**
- [ ] importAll, importTransactions, importSettings 구현
- [ ] 8개 테스트 통과

---

### Step 10: ServiceRegistry 등록

**파일:** `src/services/ServiceRegistry.ts` (수정)

**작업 내용:**
1. `googleAuthService` 인스턴스 추가
2. `googleSheetsService` 인스턴스 추가
3. export

**완료 기준:**
- [ ] ServiceRegistry에 등록
- [ ] 기존 테스트 통과

---

### Step 11: BackupRestoreSection 컴포넌트

**파일:** `src/views/components/BackupRestoreSection.tsx` (신규)

**UI 와이어프레임:**
```
┌────────────────────────────────────┐
│  Google Sheets 연동                │
├────────────────────────────────────┤
│                                    │
│  [미연결 상태]                      │
│  ┌──────────────────────────┐      │
│  │  🔗 Google 계정 연결     │      │
│  └──────────────────────────┘      │
│                                    │
│  ── 또는 (연결 후) ──               │
│                                    │
│  ✅ 연결됨: ethan@gmail.com        │
│  스프레드시트 ID: ___________       │
│  마지막 동기화: 2026-03-13 14:30   │
│                                    │
│  ┌────────────┐ ┌────────────┐    │
│  │ 📤 내보내기 │ │ 📥 가져오기 │    │
│  └────────────┘ └────────────┘    │
│                                    │
│  ┌──────────────────────────┐      │
│  │  🔓 연결 해제            │      │
│  └──────────────────────────┘      │
└────────────────────────────────────┘
```

**상태 관리:**
```typescript
const [isSignedIn, setIsSignedIn] = useState(false);
const [spreadsheetId, setSpreadsheetId] = useState('');
const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
const [lastSync, setLastSync] = useState<Date | null>(null);
const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
```

**기능:**
1. Google 로그인/로그아웃
2. 스프레드시트 ID 입력 (TextInput)
3. 내보내기 버튼 → 진행 중 스피너 → 결과 표시
4. 가져오기 버튼 → 확인 Alert → 진행 중 스피너 → 결과 표시
5. 마지막 동기화 시간 표시

**가져오기 시 경고:**
```
⚠️ 가져오기를 실행하면 현재 로컬 데이터가 모두 삭제되고
Google Sheets 데이터로 대체됩니다.

계속하시겠습니까?

[취소] [가져오기]
```

**테스트 케이스 (8개):**

| # | 테스트명 |
|---|---------|
| 1 | 미연결 시 로그인 버튼 표시 |
| 2 | 연결 후 내보내기/가져오기 버튼 표시 |
| 3 | 내보내기 버튼 클릭 시 exportAll 호출 |
| 4 | 가져오기 버튼 클릭 시 확인 Alert 표시 |
| 5 | 동기화 중 스피너 표시 |
| 6 | 성공 시 결과 메시지 표시 |
| 7 | 에러 시 에러 메시지 표시 |
| 8 | 연결 해제 시 signOut 호출 |

**완료 기준:**
- [ ] 컴포넌트 구현 (테마 적용 포함)
- [ ] 8개 테스트 통과

---

### Step 12: SettingsScreen에 백업/복원 통합

**파일:** `src/views/screens/SettingsScreen.tsx` (수정)

**작업 내용:**
- 테마 설정 아래에 `<BackupRestoreSection />` 추가
- 기존 카테고리/결제수단 탭 위치는 유지

```
┌────────────────────────────────────┐
│  테마 설정                          │
│  [라이트] [다크] [시스템]            │
├────────────────────────────────────┤
│  Google Sheets 연동                │
│  [로그인] 또는 [내보내기] [가져오기]  │
├────────────────────────────────────┤
│  [카테고리] [결제수단]              │
│  ...기존 콘텐츠...                  │
└────────────────────────────────────┘
```

**완료 기준:**
- [ ] BackupRestoreSection 통합
- [ ] 기존 SettingsScreen 테스트 통과

---

### Step 13: 전체 테스트 검증

**작업 내용:**
1. `npm test` — 전체 통과 확인
2. `npm run lint` — ESLint 에러 없음
3. `npm run test:coverage` — 커버리지 유지 확인

**신규 테스트 예상:**
- GoogleAuthService: 8개
- GoogleSheetsService (기본 API): 6개
- GoogleSheetsService (내보내기): 8개
- GoogleSheetsService (가져오기): 8개
- BackupRestoreSection: 8개
- **합계: ~38개 신규 테스트**

**완료 기준:**
- [ ] 기존 612개 + 신규 ~38개 = 650개+ 테스트 통과
- [ ] 커버리지 95%+ 유지
- [ ] ESLint 에러 없음

---

## 4. 수용 기준

- [ ] Google 로그인/로그아웃 동작
- [ ] 스프레드시트 ID 입력 후 연결 테스트 가능
- [ ] 내보내기: 로컬 전체 데이터 → Google Sheets 쓰기
- [ ] 가져오기: Google Sheets 데이터 → 로컬 덮어쓰기
- [ ] 동기화 진행 상태 UI 표시
- [ ] 에러 발생 시 사용자에게 메시지 표시
- [ ] 마지막 동기화 시간 표시 및 영속화
- [ ] 기존 기능에 영향 없음

---

## 5. 커밋 계획

| 순서 | 범위 | 커밋 메시지 |
|------|------|-----------|
| 1 | Step 2~4 | `Chore: Google Sheets 연동 패키지 설치 및 타입/상수 정의` |
| 2 | Step 5 | `Feat: GoogleAuthService OAuth 인증 구현` |
| 3 | Step 6~7 | `Feat: GoogleSheetsService 인터페이스 및 기본 API 구현` |
| 4 | Step 8 | `Feat: Google Sheets 내보내기 기능 구현` |
| 5 | Step 9 | `Feat: Google Sheets 가져오기 기능 구현` |
| 6 | Step 10~12 | `Feat: 설정 화면 백업/복원 UI 구현` |
| 7 | Step 13 | `Test: 전체 테스트 통과 및 커버리지 확인` |
| 8 | 문서 | `Docs: Phase 3 작업 로그` |
