# CloudPocket

Google Sheets 백업 기반 개인 재정 관리 모바일 앱

## 주요 기능

- **거래 관리**: 수입/지출 등록, 목록 조회 (필터링), 잔액 요약
- **캘린더 뷰**: 월별 캘린더에서 일별 잔액 확인, 날짜별 거래 상세
- **통계**: 카테고리별/결제수단별 분석, 도넛차트, 월별 추이 바차트
- **카테고리**: 대분류/소분류 계층 구조, 수입/지출 분리, 아이콘 선택
- **결제수단**: 신용/체크/현금/계좌 관리
- **저축/자산**: 저축 상품 관리, 은행 계좌 자산 현황

## 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | React Native + Expo (SDK 54) |
| Language | TypeScript |
| Navigation | React Navigation 7 (Bottom Tabs) |
| Storage | AsyncStorage (Offline-First) |
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

## 테스트 커버리지

| 영역 | 목표 | 현재 |
|------|------|------|
| 전체 | 80% | **95.11%** |
| 서비스 레이어 | 100% | 100% |
| UI 컴포넌트 | 100% | 100% |

```
Test Suites: 22 passed
Tests:       612 passed
```

## 개발 로드맵

### Phase 1: MVP (완료)
- [x] 서비스 레이어 TDD (Category, PaymentMethod, Transaction)
- [x] 기본 UI 화면 (Home, AddTransaction, Settings)
- [x] UI 테스트

### Phase 1.5: UI 완성 (진행 중)
- [x] 캘린더 뷰 (CalendarGrid, DayCell, DayDetailModal)
- [x] 통계 탭 (DonutChart, GroupedBarChart, BreakdownList)
- [ ] 테마 (Light/Dark)

### Phase 2: 데이터 영속성 (완료)
- [x] StorageService 추상화 레이어
- [x] 7개 도메인 서비스 AsyncStorage 연동
- [x] AppInitializer + SeedService
- [x] 84개 영속화 테스트 추가

### Phase 3: Google Sheets 동기화
- [ ] Google OAuth 인증
- [ ] 내보내기/가져오기 (수동 백업/복원)
- [ ] 설정 UI

### Phase 4: 고도화 + iOS 배포
- [ ] 예산 설정 및 알림
- [ ] 정기 거래 자동 등록
- [ ] EAS Build → 개인 디바이스 배포

## 문서

- [설계 문서](docs/design/)
- [API 문서](docs/api/)
- [작업 로그](docs/logs/)

## 라이선스

Private
