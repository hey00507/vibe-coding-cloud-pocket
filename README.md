# CloudPocket

Excel 가계부 템플릿 기반 개인 재정 관리 모바일 앱 (Google Sheets 백업/복원)

## 프로젝트 목표

기존 Excel 가계부 템플릿의 시트별 기능을 100% 활용하여 시각화하는 iOS 앱.
App Store 미배포, 개인 디바이스 전용.

## 주요 기능

- **거래 관리**: 수입/지출 등록, 목록 조회 (필터링), 잔액 요약
- **캘린더 뷰**: 월별 캘린더에서 일별 잔액 확인, 날짜별 거래 상세
- **통계**: 카테고리별/결제수단별 분석, 도넛차트, 월별 추이 바차트, 연간 대시보드
- **카테고리**: 대분류/소분류 계층 구조, 수입/지출 분리, 아이콘 선택
- **결제수단**: 신용/체크/현금/계좌 관리
- **저축/자산**: 저축 상품 관리, 은행 계좌 자산 현황 (서비스 완료, UI 구현 예정)
- **수입 목표**: 카테고리별 수입 목표 설정 (서비스 완료, UI 구현 예정)
- **테마**: Light/Dark/System 모드

## 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | React Native + Expo (SDK 54) |
| Language | TypeScript |
| Navigation | React Navigation 7 (Bottom Tabs) |
| Storage | AsyncStorage (Offline-First) |
| Cloud Sync | Google Sheets API (수동 백업/복원) |
| Testing | Jest + React Testing Library |
| Architecture | MVC + 인터페이스 기반 서비스 |

## 시작하기

```bash
npm install
npm start          # Expo 개발 서버
npm run ios        # iOS 시뮬레이터
npm test           # 전체 테스트
npm run test:coverage  # 커버리지 리포트
npm run lint       # ESLint 검사
```

## 테스트 현황

| 영역 | 목표 | 현재 |
|------|------|------|
| 전체 | 80% | **95.11%** |
| 서비스 레이어 | 100% | 100% |
| UI 컴포넌트 | 100% | 100% |

```
Test Suites: 49 passed
Tests:       661 passed
```

## 개발 로드맵

### Phase 1: MVP ✅ 완료
- [x] 서비스 레이어 TDD (Category, PaymentMethod, Transaction + 4개 추가)
- [x] 기본 UI 화면 (Home, AddTransaction, Statistics, Settings)
- [x] UI 테스트 (612개)

### Phase 1.5: UI 완성 ✅ 완료
- [x] 캘린더 뷰 (CalendarGrid, DayCell, DayDetailModal)
- [x] 통계 탭 (DonutChart, GroupedBarChart, AnnualDashboard)
- [x] 테마 시스템 (Light/Dark/System, 30+ 색상 토큰)

### Phase 2: 데이터 영속성 ✅ 완료
- [x] StorageService 추상화 레이어
- [x] 7개 도메인 서비스 AsyncStorage 연동
- [x] AppInitializer + SeedService

### Phase 3: Google Sheets 연동 🔴 GCP 설정 필요
- [x] GoogleAuthService (OAuth 2.0 + 토큰 갱신)
- [x] GoogleSheetsService (내보내기/가져오기)
- [x] BackupRestoreSection UI
- [ ] GCP 프로젝트 설정 + 실기기 테스트

### Phase 4: 템플릿 완전 활용 ⏳ 대기
- [ ] 수입 관리 화면 (IncomeTargetService UI 연결)
- [ ] 저축 관리 화면 (SavingsService UI 연결)
- [ ] 자산 관리 화면 (BankAccountService UI 연결)
- [ ] 시각화 강화 (연간 대시보드, 월간 요약, 카테고리 피벗)

## 문서

- [TODO 목록](todo/)
- [설계 문서](docs/design/)
- [작업 로그](docs/logs/)

## 라이선스

Private
