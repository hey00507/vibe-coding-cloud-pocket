# CloudPocket

Google Sheets를 활용한 개인 재정 관리 모바일 앱

## 주요 기능

### 거래 관리
- **수입/지출 등록**: 금액, 카테고리, 결제수단, 메모, 날짜
- **거래 목록 조회**: 전체/수입/지출 필터링
- **잔액 요약**: 총 수입, 총 지출, 잔액 표시

### 카테고리 관리
- 수입/지출별 카테고리 분리
- 아이콘 선택 기능
- CRUD (생성, 조회, 수정, 삭제)

### 결제수단 관리
- 신용카드, 현금, 계좌이체 등 관리
- 아이콘 선택 기능
- CRUD (생성, 조회, 수정, 삭제)

## 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | React Native + Expo (SDK 52) |
| Language | TypeScript |
| Navigation | React Navigation (Bottom Tabs) |
| Testing | Jest + React Testing Library |
| Architecture | MVC 패턴 |
| Backend (예정) | Google Sheets API |

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run web        # 웹 브라우저
```

### 테스트

```bash
npm test              # 전체 테스트 실행
npm run test:watch    # 테스트 감시 모드
npm run test:coverage # 커버리지 리포트
```

### 코드 품질 검사

```bash
npm run lint       # ESLint 검사
npm run lint:fix   # ESLint 자동 수정
npm run format     # Prettier 포맷팅
```

## 프로젝트 구조

```
src/
├── models/          # 데이터 모델 및 비즈니스 로직
├── views/           # UI 컴포넌트
│   ├── screens/     # 화면 단위 컴포넌트
│   │   ├── HomeScreen.tsx         # 메인 화면 (거래 목록, 요약)
│   │   ├── AddTransactionScreen.tsx # 거래 추가
│   │   └── SettingsScreen.tsx     # 설정 (카테고리, 결제수단)
│   └── components/  # 재사용 가능한 컴포넌트
│       ├── SummaryCard.tsx        # 잔액/수입/지출 요약
│       └── TransactionItem.tsx    # 거래 항목
├── controllers/     # 상태 관리, 이벤트 핸들링
├── services/        # 서비스 레이어
│   ├── interfaces/  # 서비스 인터페이스
│   ├── CategoryService.ts
│   ├── PaymentMethodService.ts
│   └── TransactionService.ts
├── utils/           # 유틸리티 함수
├── constants/       # 상수 정의
└── types/           # TypeScript 타입 정의

__tests__/           # 테스트 파일
├── services/        # 서비스 테스트
├── components/      # 컴포넌트 테스트
└── screens/         # 화면 테스트

docs/                # 문서
├── api/             # API 명세서
├── design/          # 설계 문서
└── logs/            # 작업 로그
```

## 테스트 커버리지

| 영역 | 목표 | 현재 |
|------|------|------|
| 전체 | 80% | 85.92% |
| 서비스 레이어 | 100% | 100% |
| UI 컴포넌트 | 100% | 100% |
| 화면 | 75% | 75%+ |

```
Test Suites: 9 passed
Tests:       137 passed
```

## 개발 로드맵

### Phase 1: MVP (완료)
- [x] 프로젝트 설정
- [x] 서비스 레이어 (TDD)
- [x] 기본 UI 화면
- [x] UI 테스트

### Phase 1.5: UI 완성 (진행 중)
- [ ] 캘린더 뷰
- [ ] 테마 (Light/Dark)

### Phase 2: 데이터 영속성
- [ ] AsyncStorage 연동
- [ ] 서비스 레이어 연동
- [ ] 앱 시작 시 데이터 로드

### Phase 3: Google Sheets 동기화
> Offline-First 아키텍처: 로컬 우선, 수동 백업/복원
- [ ] Google OAuth 인증
- [ ] 내보내기/가져오기 기능
- [ ] 설정 UI

### Phase 4: 고도화
- [ ] 통계 및 리포트
- [ ] 예산 설정
- [ ] 정기 거래

## 문서

- [API 문서](docs/api/README.md)
- [설계 문서](docs/design/2026-02-04-initial.md)
- [작업 로그](docs/logs/)

## 라이선스

Private
