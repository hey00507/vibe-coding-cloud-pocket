# CloudPocket TODO

프로젝트 개발 작업 목록을 Phase별로 관리합니다.

---

## 개발 방법론

### TDD (Test-Driven Development)
모든 코드는 TDD 방식으로 개발합니다.

```
1. Red   - 실패하는 테스트 먼저 작성
2. Green - 테스트 통과하는 최소 구현
3. Refactor - 코드 정리 및 개선
```

### 도메인 단위 개발
기능을 도메인별로 분리하여 독립적으로 개발합니다.

### 인터페이스 기반 설계
서비스는 항상 인터페이스를 먼저 정의하고 구현합니다.

### API 문서화
- API 명세서: `docs/api/` 디렉토리
- JSON 예시: `docs/api/examples/` 디렉토리
- API 테스트 페이지: 개발 환경에서 Swagger 스타일 테스트 지원

---

## 진행 상황 요약

| Phase | 상태 | 설명 | 품질 기준 |
|-------|------|------|----------|
| Phase 1 | 🚧 진행 중 | MVP - 기본 가계부 | 테스트 커버리지 80%+ |
| Phase 2 | ⏳ 대기 | Google Sheets 연동 | 테스트 커버리지 80%+ |
| Phase 3 | ⏳ 대기 | 고도화 기능 | 테스트 커버리지 80%+ |

---

## Phase 구성

### [Phase 1: MVP](./phase1-mvp.md)
기본 가계부 기능 구현

**도메인:**
- Foundation (타입, 상수, 유틸리티)
- Transaction (거래 서비스)
- Theme (테마 시스템)
- Navigation (네비게이션)
- Common (공통 UI)
- Calendar (캘린더 뷰)
- List (리스트 뷰)
- Settings (설정)

**주요 기능:**
- 수입/지출 거래 등록, 수정, 삭제
- 캘린더 뷰 (월별 일일 잔액 확인)
- 리스트 뷰 (일별 거래 내역)
- 로컬 저장소 (AsyncStorage)
- Light/Dark 테마

---

### [Phase 2: Google Sheets 연동](./phase2-google-sheets.md)
클라우드 데이터 동기화

**도메인:**
- Auth (Google 인증)
- Sheets (Google Sheets 서비스)
- Sync (동기화 시스템)
- Offline (오프라인 모드)

**주요 기능:**
- Google OAuth 인증
- Google Sheets API 연동
- 실시간 동기화
- 오프라인 모드 + 자동 동기화

---

### [Phase 3: 고도화](./phase3-advanced.md)
고급 재정 관리 기능

**도메인:**
- Account (자산 관리)
- Budget (예산 관리)
- Statistics (통계/리포트)
- Recurring (정기 거래)
- Export (데이터 내보내기)
- Category (커스텀 카테고리)

**주요 기능:**
- 자산 관리 (계좌, 카드 등록)
- 예산 설정 및 알림
- 통계 및 리포트 (차트)
- 정기 거래 자동 등록
- 데이터 내보내기 (CSV, PDF)
- 커스텀 카테고리

---

## TDD 작업 흐름

각 기능 개발 시 아래 순서를 따릅니다:

```
1. 타입/인터페이스 정의
   └── src/types/, src/services/interfaces/

2. 테스트 파일 생성
   └── __tests__/services/, __tests__/controllers/, __tests__/components/

3. 테스트 케이스 작성 (Red)
   └── 실패하는 테스트 먼저

4. 구현 (Green)
   └── 테스트 통과하는 최소 코드

5. 리팩토링 (Refactor)
   └── 코드 정리, 테스트 유지

6. API 문서화
   └── docs/api/

7. 검증
   └── npm test, npm run test:coverage
```

---

## 테스트 디렉토리 구조

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

---

## API 문서 디렉토리 구조

```
docs/
├── api/
│   ├── README.md                    # API 개요
│   ├── transaction-service.md       # 거래 서비스 명세
│   ├── google-auth.md               # Google 인증 명세
│   ├── google-sheets.md             # Google Sheets 명세
│   ├── sync.md                      # 동기화 명세
│   ├── account-service.md           # 계좌 서비스 명세
│   ├── budget-service.md            # 예산 서비스 명세
│   ├── statistics-service.md        # 통계 서비스 명세
│   └── examples/
│       ├── transaction-create.json
│       ├── transaction-response.json
│       ├── daily-summary.json
│       └── ...
└── setup/
    └── google-cloud-setup.md        # GCP 설정 가이드
```

---

## 완료 체크리스트

### Phase 1 완료 기준
**기능:**
- [ ] 수입/지출 거래를 추가, 수정, 삭제할 수 있다
- [ ] 캘린더 뷰에서 월별 일일 잔액을 확인할 수 있다
- [ ] 리스트 뷰에서 일별 거래 내역을 확인할 수 있다
- [ ] 앱을 종료해도 데이터가 유지된다
- [ ] Light/Dark 테마를 변경할 수 있다

**품질:**
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 모든 테스트 통과 (npm test)
- [ ] ESLint 에러 없음 (npm run lint)
- [ ] 서비스 API 문서화 완료

### Phase 2 완료 기준
**기능:**
- [ ] Google 계정으로 로그인할 수 있다
- [ ] 거래 데이터가 Google Sheets에 자동 동기화된다
- [ ] 오프라인에서도 앱을 사용할 수 있다
- [ ] 온라인 복귀 시 자동으로 동기화된다

**품질:**
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] API 문서화 완료
- [ ] API 테스트 페이지 동작

### Phase 3 완료 기준
**기능:**
- [ ] 여러 계좌를 등록하고 관리할 수 있다
- [ ] 카테고리별 예산을 설정하고 확인할 수 있다
- [ ] 통계 차트로 지출 패턴을 분석할 수 있다
- [ ] 정기 거래가 자동으로 등록된다
- [ ] 거래 내역을 CSV/PDF로 내보낼 수 있다

**품질:**
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] API 문서화 완료
- [ ] API 테스트 페이지 동작

---

## 참고 문서

- [설계 문서](../docs/design/2026-02-04-initial.md)
- [CLAUDE.md](../CLAUDE.md)
