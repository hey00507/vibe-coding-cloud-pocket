# Phase 2: Google Sheets 연동 작업 목록

## 개요
Google Sheets API 연동을 통한 클라우드 데이터 동기화

> **선행 조건**: Phase 1 MVP 완료

### 개발 방법론
- **TDD (Test-Driven Development)**: 테스트 코드 먼저 작성 → 테스트 통과하는 코드 구현 → 리팩토링
- **도메인 단위 개발**: Auth, Sheets, Sync 도메인으로 분리
- **인터페이스 기반 설계**: 기존 ITransactionService 인터페이스 유지

### TDD 작업 흐름
```
1. 테스트 파일 생성 (*.test.ts / *.spec.ts)
2. 실패하는 테스트 작성 (Red) - Mock을 활용한 단위 테스트
3. 테스트 통과하는 최소 구현 (Green)
4. 코드 정리 및 개선 (Refactor)
5. 다음 테스트 케이스로 반복
```

---

## 0. 테스트 환경 확장

### 0.1 API 모킹 설정
- [ ] Google API Mock 설정
- [ ] `__mocks__/googleapis.ts` 생성
- [ ] 네트워크 요청 모킹 설정 (MSW 또는 nock)

### 0.2 테스트 디렉토리 확장
```
__tests__/
├── services/
│   ├── GoogleAuthService.test.ts
│   ├── GoogleSheetsService.test.ts
│   ├── GoogleSheetsTransactionService.test.ts
│   ├── SyncService.test.ts
│   └── OfflineQueue.test.ts
└── controllers/
    ├── useGoogleAuth.test.ts
    ├── useSync.test.ts
    └── useNetworkStatus.test.ts
```

---

## 1. Google Cloud 프로젝트 설정

### 1.1 GCP 콘솔 설정
- [ ] Google Cloud 프로젝트 생성
- [ ] Google Sheets API 활성화
- [ ] Google Drive API 활성화
- [ ] OAuth 2.0 클라이언트 ID 생성 (iOS)
- [ ] OAuth 2.0 클라이언트 ID 생성 (Android)
- [ ] OAuth 동의 화면 설정

### 1.2 앱 설정
- [ ] iOS: URL Scheme 설정 (Google Sign-In 콜백)
- [ ] Android: SHA-1 인증서 등록
- [ ] Expo 설정 파일에 Google OAuth 정보 추가

### 1.3 환경 설정 문서화
- [ ] `docs/setup/google-cloud-setup.md` 생성
  - [ ] GCP 프로젝트 생성 가이드
  - [ ] API 활성화 단계
  - [ ] OAuth 설정 단계
  - [ ] 앱 설정 단계

---

## 2. Google 인증 (Auth 도메인)

### 2.1 타입 정의
- [ ] `src/types/auth.ts` 생성
  - [ ] `GoogleUser` 인터페이스 정의
  - [ ] `AuthState` 타입 정의
  - [ ] `AuthError` 타입 정의

### 2.2 인증 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/GoogleAuthService.test.ts` 생성
  - [ ] `signIn()` 테스트 케이스
    - [ ] 성공 시 GoogleUser 반환
    - [ ] 사용자 취소 시 에러
    - [ ] 네트워크 에러 처리
  - [ ] `signOut()` 테스트 케이스
  - [ ] `getAccessToken()` 테스트 케이스
    - [ ] 유효한 토큰 반환
    - [ ] 만료된 토큰 시 갱신
  - [ ] `refreshToken()` 테스트 케이스
  - [ ] `isSignedIn()` 테스트 케이스
  - [ ] `getCurrentUser()` 테스트 케이스

- [ ] **구현**: `src/services/GoogleAuthService.ts` 생성
  - [ ] `signIn(): Promise<GoogleUser>` - Google 로그인
  - [ ] `signOut(): Promise<void>` - 로그아웃
  - [ ] `getAccessToken(): Promise<string>` - 액세스 토큰 조회
  - [ ] `refreshToken(): Promise<string>` - 토큰 갱신
  - [ ] `isSignedIn(): Promise<boolean>` - 로그인 상태 확인
  - [ ] `getCurrentUser(): Promise<GoogleUser | null>` - 현재 사용자 정보

- [ ] **검증**: 모든 테스트 통과 확인

### 2.3 인증 컨트롤러 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useGoogleAuth.test.ts` 생성
  - [ ] 초기 상태 테스트
  - [ ] signIn 성공/실패 테스트
  - [ ] signOut 테스트
  - [ ] 로딩 상태 테스트
  - [ ] 에러 상태 테스트

- [ ] **구현**: `src/controllers/useGoogleAuth.ts` 생성
  - [ ] 로그인 상태 관리
  - [ ] 사용자 정보 상태
  - [ ] 로딩/에러 상태
  - [ ] signIn, signOut 함수 노출

- [ ] **검증**: 모든 테스트 통과 확인

### 2.4 인증 UI
- [ ] 설정 화면에 Google 계정 연동 섹션 구현
  - [ ] 로그인 버튼 (미연동 시)
  - [ ] 연결된 계정 정보 표시 (연동 시)
  - [ ] 로그아웃 버튼
  - [ ] 연동 상태 표시

### 2.5 인증 API 문서화
- [ ] `docs/api/google-auth.md` 생성
  - [ ] GoogleAuthService 인터페이스 설명
  - [ ] 각 메서드 설명
  - [ ] 에러 코드 및 처리 방법
- [ ] `docs/api/examples/` 디렉토리에 추가
  - [ ] `google-user.json` - 사용자 정보 예시
  - [ ] `auth-error.json` - 에러 응답 예시

---

## 3. Google Sheets 서비스 (Sheets 도메인)

### 3.1 Sheets 스프레드시트 관리 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/GoogleSheetsService.test.ts` 생성
  - [ ] `createSpreadsheet()` 테스트 케이스
  - [ ] `getSpreadsheetId()` 테스트 케이스
  - [ ] `setSpreadsheetId()` 테스트 케이스
  - [ ] `initializeSheets()` 테스트 케이스
    - [ ] 시트 생성 확인
    - [ ] 헤더 설정 확인

- [ ] **구현**: `src/services/GoogleSheetsService.ts` 생성
  - [ ] `createSpreadsheet(title: string): Promise<string>` - 새 스프레드시트 생성
  - [ ] `getSpreadsheetId(): Promise<string | null>` - 저장된 스프레드시트 ID 조회
  - [ ] `setSpreadsheetId(id: string): Promise<void>` - 스프레드시트 ID 저장
  - [ ] `initializeSheets(): Promise<void>` - 필요한 시트/헤더 초기화

- [ ] **검증**: 모든 테스트 통과 확인

### 3.2 데이터 구조 설계
- [ ] 스프레드시트 시트 구조 정의
  - [ ] `Transactions` 시트 (A: id, B: type, C: amount, D: category, E: memo, F: date, G: time, H: createdAt, I: updatedAt)
  - [ ] `Categories` 시트 (커스텀 카테고리용)
  - [ ] `Settings` 시트 (동기화 설정 등)

### 3.3 Google Sheets Transaction 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/GoogleSheetsTransactionService.test.ts` 생성
  - [ ] `getAll()` 테스트 케이스
    - [ ] 빈 시트
    - [ ] 데이터 있는 시트
    - [ ] 파싱 정확성
  - [ ] `getByDateRange()` 테스트 케이스
  - [ ] `getById()` 테스트 케이스
  - [ ] `create()` 테스트 케이스
    - [ ] 행 추가 확인
    - [ ] 반환값 확인
  - [ ] `update()` 테스트 케이스
    - [ ] 행 수정 확인
    - [ ] 존재하지 않는 ID 에러
  - [ ] `delete()` 테스트 케이스
  - [ ] `getDailySummary()` 테스트 케이스
  - [ ] `getMonthlySummary()` 테스트 케이스
  - [ ] 내부 헬퍼 테스트
    - [ ] `_parseRow()` 테스트
    - [ ] `_toRow()` 테스트

- [ ] **구현**: `src/services/GoogleSheetsTransactionService.ts` 생성
  - [ ] ITransactionService 구현
  - [ ] `getAll()` 구현 - 시트 전체 읽기
  - [ ] `getByDateRange()` 구현 - 날짜 필터링
  - [ ] `getById()` 구현 - 특정 행 찾기
  - [ ] `create()` 구현 - 행 추가
  - [ ] `update()` 구현 - 행 수정
  - [ ] `delete()` 구현 - 행 삭제
  - [ ] `getDailySummary()` 구현
  - [ ] `getMonthlySummary()` 구현
  - [ ] 내부 헬퍼: `_parseRow()`, `_toRow()`, `_findRowById()`

- [ ] **검증**: 모든 테스트 통과 확인 (커버리지 80% 이상)

### 3.4 Sheets API 문서화
- [ ] `docs/api/google-sheets.md` 생성
  - [ ] 스프레드시트 구조 설명
  - [ ] 각 시트 컬럼 명세
  - [ ] API 호출 방식
- [ ] `docs/api/examples/` 디렉토리에 추가
  - [ ] `sheet-row.json` - 시트 행 데이터 예시
  - [ ] `spreadsheet-structure.json` - 스프레드시트 구조 예시

---

## 4. 동기화 시스템 (Sync 도메인)

### 4.1 동기화 서비스 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/SyncService.test.ts` 생성
  - [ ] `syncToCloud()` 테스트 케이스
    - [ ] 로컬 변경사항 업로드
    - [ ] 충돌 없는 경우
  - [ ] `syncFromCloud()` 테스트 케이스
    - [ ] 클라우드 변경사항 다운로드
  - [ ] `fullSync()` 테스트 케이스
    - [ ] 양방향 동기화
    - [ ] 충돌 감지
  - [ ] `getLastSyncTime()` 테스트 케이스
  - [ ] `setLastSyncTime()` 테스트 케이스

- [ ] **구현**: `src/services/SyncService.ts` 생성
  - [ ] `syncToCloud(): Promise<void>` - 로컬 → 클라우드
  - [ ] `syncFromCloud(): Promise<void>` - 클라우드 → 로컬
  - [ ] `fullSync(): Promise<void>` - 양방향 동기화
  - [ ] `getLastSyncTime(): Promise<Date | null>`
  - [ ] `setLastSyncTime(): Promise<void>`

- [ ] **검증**: 모든 테스트 통과 확인

### 4.2 충돌 해결 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/ConflictResolver.test.ts` 생성
  - [ ] 충돌 감지 테스트
  - [ ] 최신 우선 전략 테스트
  - [ ] 수동 선택 전략 테스트

- [ ] **구현**: `src/services/ConflictResolver.ts` 생성
  - [ ] 충돌 감지 로직
  - [ ] 충돌 해결 전략 (최신 우선 / 수동 선택)
  - [ ] 충돌 알림 UI 컴포넌트

- [ ] **검증**: 모든 테스트 통과 확인

### 4.3 동기화 컨트롤러 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useSync.test.ts` 생성
  - [ ] 초기 상태 테스트
  - [ ] 동기화 상태 변경 테스트
  - [ ] 에러 상태 테스트
  - [ ] 자동 동기화 트리거 테스트

- [ ] **구현**: `src/controllers/useSync.ts` 생성
  - [ ] 동기화 상태 관리 (idle, syncing, error)
  - [ ] 마지막 동기화 시간
  - [ ] 수동 동기화 트리거
  - [ ] 자동 동기화 스케줄링 (앱 foreground 시)

- [ ] **검증**: 모든 테스트 통과 확인

### 4.4 동기화 UI
- [ ] 동기화 상태 인디케이터 컴포넌트
- [ ] 설정 화면에 동기화 옵션 추가
  - [ ] 자동 동기화 ON/OFF
  - [ ] 수동 동기화 버튼
  - [ ] 마지막 동기화 시간 표시

### 4.5 동기화 API 문서화
- [ ] `docs/api/sync.md` 생성
  - [ ] 동기화 전략 설명
  - [ ] 충돌 해결 방식
  - [ ] 에러 처리 방법
- [ ] `docs/api/examples/` 디렉토리에 추가
  - [ ] `sync-conflict.json` - 충돌 상황 예시
  - [ ] `sync-result.json` - 동기화 결과 예시

---

## 5. 오프라인 모드 (Offline 도메인)

### 5.1 오프라인 큐 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/OfflineQueue.test.ts` 생성
  - [ ] 작업 큐잉 테스트
  - [ ] 큐 처리 테스트
  - [ ] 큐 영속성 테스트
  - [ ] 큐 순서 보장 테스트

- [ ] **구현**: `src/services/OfflineQueue.ts` 생성
  - [ ] 오프라인 상태에서 작업 큐잉
  - [ ] 온라인 복귀 시 큐 처리
  - [ ] 큐 영속 저장 (AsyncStorage)

- [ ] **검증**: 모든 테스트 통과 확인

### 5.2 네트워크 상태 감지 (TDD)
- [ ] **테스트 먼저**: `__tests__/controllers/useNetworkStatus.test.ts` 생성
  - [ ] 초기 상태 테스트
  - [ ] 온라인/오프라인 전환 테스트
  - [ ] 이벤트 리스너 테스트

- [ ] **구현**: `src/controllers/useNetworkStatus.ts` 생성
  - [ ] 네트워크 연결 상태 감지
  - [ ] 온라인/오프라인 전환 이벤트 처리

- [ ] **검증**: 모든 테스트 통과 확인

### 5.3 오프라인 UI
- [ ] 오프라인 배너 컴포넌트
- [ ] 동기화 대기 중 표시

---

## 6. 서비스 팩토리 업데이트

### 6.1 서비스 전환 로직 (TDD)
- [ ] **테스트 먼저**: `__tests__/services/ServiceFactory.test.ts` 생성
  - [ ] 로그인 전 LocalService 반환 테스트
  - [ ] 로그인 후 GoogleSheetsService 반환 테스트
  - [ ] 서비스 전환 테스트

- [ ] **구현**: `src/services/index.ts` 수정
  - [ ] 로그인 상태에 따른 서비스 선택
  - [ ] 로컬 → 클라우드 전환 시 데이터 마이그레이션 옵션

- [ ] **검증**: 모든 테스트 통과 확인

---

## 7. API 테스트 페이지 (개발 환경)

### 7.1 API 테스트 화면
- [ ] `src/views/screens/dev/ApiTestScreen.tsx` 생성 (개발 환경 전용)
  - [ ] Google Auth API 테스트 섹션
    - [ ] signIn 버튼
    - [ ] signOut 버튼
    - [ ] 현재 사용자 정보 표시
  - [ ] Google Sheets API 테스트 섹션
    - [ ] 스프레드시트 생성 버튼
    - [ ] 데이터 읽기 버튼
    - [ ] 데이터 쓰기 버튼
  - [ ] Sync API 테스트 섹션
    - [ ] syncToCloud 버튼
    - [ ] syncFromCloud 버튼
    - [ ] fullSync 버튼
  - [ ] 요청/응답 로그 표시

### 7.2 개발 메뉴
- [ ] 설정 화면에 개발자 메뉴 추가 (DEV 환경만)
  - [ ] API 테스트 페이지 진입
  - [ ] 로컬 데이터 초기화
  - [ ] 로그 확인

---

## 8. 의존성 추가

- [ ] `@react-native-google-signin/google-signin` 또는 `expo-auth-session` 설치
- [ ] `googleapis` 또는 직접 API 호출 구현
- [ ] `@react-native-community/netinfo` 설치
- [ ] (선택) `msw` - API 모킹용

---

## 9. 통합 테스트 및 검증

### 9.1 단위 테스트 커버리지 확인
- [ ] `npm run test:coverage` 실행
- [ ] Phase 2 관련 코드 커버리지 80% 이상 확인
- [ ] 서비스 레이어 90% 이상 확인

### 9.2 인증 테스트
- [ ] Google 로그인/로그아웃 테스트
- [ ] 토큰 갱신 테스트
- [ ] 앱 재시작 시 로그인 유지 테스트

### 9.3 동기화 테스트
- [ ] 새 거래 추가 후 Sheets 반영 확인
- [ ] Sheets에서 직접 수정 후 앱 반영 확인
- [ ] 오프라인에서 추가 → 온라인 복귀 → 동기화 테스트
- [ ] 충돌 시나리오 테스트

### 9.4 엣지 케이스
- [ ] 스프레드시트 삭제 시 처리
- [ ] Google 권한 취소 시 처리
- [ ] 네트워크 불안정 상황 처리

---

## 작업 순서 권장 (TDD 기반)

```
0단계: 테스트 환경 확장
  └── API 모킹 설정

1단계: Google Cloud 설정
  └── GCP 프로젝트 및 앱 설정

2단계: Google 인증 (Auth 도메인)
  ├── 타입 정의
  ├── GoogleAuthService (테스트 → 구현 → 검증)
  ├── useGoogleAuth (테스트 → 구현 → 검증)
  ├── 인증 UI
  └── API 문서화

3단계: Google Sheets 서비스 (Sheets 도메인)
  ├── GoogleSheetsService (테스트 → 구현 → 검증)
  ├── GoogleSheetsTransactionService (테스트 → 구현 → 검증)
  └── API 문서화

4단계: 동기화 시스템 (Sync 도메인)
  ├── SyncService (테스트 → 구현 → 검증)
  ├── ConflictResolver (테스트 → 구현 → 검증)
  ├── useSync (테스트 → 구현 → 검증)
  ├── 동기화 UI
  └── API 문서화

5단계: 오프라인 모드 (Offline 도메인)
  ├── OfflineQueue (테스트 → 구현 → 검증)
  ├── useNetworkStatus (테스트 → 구현 → 검증)
  └── 오프라인 UI

6단계: 서비스 팩토리 업데이트
  └── 서비스 전환 로직 (테스트 → 구현 → 검증)

7단계: API 테스트 페이지 (개발 환경)

8단계: 통합 테스트 및 커버리지 확인
```

---

## 완료 기준

Phase 2는 다음 조건이 모두 충족되면 종료:

### 기능 요구사항
- [ ] Google 계정으로 로그인할 수 있다
- [ ] 거래 데이터가 Google Sheets에 자동 동기화된다
- [ ] 오프라인에서도 앱을 사용할 수 있다
- [ ] 온라인 복귀 시 자동으로 동기화된다
- [ ] Google Sheets에서 직접 데이터 수정이 가능하다

### 품질 요구사항
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 모든 테스트 통과 (npm test)
- [ ] ESLint 에러 없음 (npm run lint)
- [ ] API 문서화 완료 (docs/api/)
- [ ] API 테스트 페이지 동작 (개발 환경)
