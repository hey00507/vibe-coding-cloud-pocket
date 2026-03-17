# CloudPocket TODO

개인 재정 관리 iOS 앱 — 개발 작업 목록

---

## 개발 방법론

- **TDD**: Red → Green → Refactor
- **도메인 단위 개발**: 기능을 도메인별로 분리하여 독립적으로 개발
- **인터페이스 기반 설계**: 서비스는 항상 인터페이스를 먼저 정의

---

## 진행 상황

| Phase | 상태 | 설명 | 테스트 |
|-------|------|------|--------|
| Phase 1 | ✅ | MVP — 거래 CRUD, 캘린더/리스트 뷰, 통계 | 661개 |
| Phase 1.5 | ✅ | 테마 시스템 (Light/Dark/System) + 캘린더 뷰 | 포함 |
| Phase 2 | ✅ | AsyncStorage 영속화 (전 서비스) | 포함 |
| Phase 3 | ✅ | Google Sheets 연동 (OAuth + 수동 백업/복원) | 포함 |
| MS1 | ✅ | 예산 기능 (카테고리별 월 예산 + 소진률 프로그레스 바) | 705개 |
| MS2 | ✅ | 자동 동기화 (앱 시작 + 포그라운드 복귀 시 export) | 717개 |
| MS5 | ✅ | 수입/저축/자산 관리 UI (전 서비스 UI 연결 완료) | 717개 |
| **MS3** | ⏳ | **Xcode 빌드 + AltStore 배포** | - |
| MS4 | 대기 | iOS 위젯 (WidgetKit, Swift) — MS3 이후 | - |
| MS6 | 대기 | 연도 전환 자동화 + 추가 위젯 | - |

---

## 서비스 현황 (14개 — 전체 UI 연결 완료)

| 서비스 | 테스트 | UI |
|--------|--------|----|
| TransactionService | ✅ | Home, AddTransaction, Statistics |
| CategoryService | ✅ | Settings (카테고리 탭) |
| SubCategoryService | ✅ | Settings (카테고리 탭) |
| PaymentMethodService | ✅ | Settings (결제수단 탭) |
| BudgetService | ✅ 100% | Settings (예산 탭) + Home |
| SavingsService | ✅ | Settings (자산 탭) + Statistics |
| BankAccountService | ✅ | Settings (자산 탭) + Statistics |
| IncomeTargetService | ✅ | Settings (자산 탭) + Statistics |
| AutoSyncService | ✅ | App.tsx (앱 시작/복귀) |
| GoogleAuthService | ✅ | Settings (Google Sheets) |
| GoogleSheetsService | ✅ | Settings + AutoSync |
| StorageService | ✅ | 전체 영속화 |
| AppInitializer | ✅ | App.tsx |
| SeedService | ✅ | 초기 데이터 |

---

## 남은 마일스톤

### MS3: Xcode 빌드 + AltStore 배포
- [ ] assets/icon.png (1024x1024) + splash.png 생성
- [ ] app.json 정비 (bundleIdentifier, 버전)
- [ ] expo prebuild → Xcode 프로젝트 생성
- [ ] Xcode 실기기 서명 + 빌드
- [ ] AltStore로 iPhone 사이드로드

### MS4: iOS 위젯 (Swift)
- [ ] WidgetKit Extension 추가
- [ ] 오늘 지출 + 예산 소진률 위젯
- [ ] App Groups로 RN ↔ Widget 데이터 공유

### MS6: 연도 전환 자동화
- [ ] 새해 스프레드시트 자동 생성
- [ ] 위젯 확장 (주간 트렌드 등)

---

## 기술 스택

- React Native + Expo (SDK 54) / TypeScript
- React Navigation (Bottom Tabs) / Jest + RTL
- AsyncStorage (영속화) / MVC 패턴
- Google Sheets API v4 (OAuth 2.0)
- 위젯: SwiftUI + WidgetKit (예정)

## 참고 문서

- [설계 문서](../docs/design/2026-02-04-initial.md)
- [데이터 아키텍처](../docs/design/data-architecture.md)
- [Google Sheets 스키마](../docs/design/google-sheets-schema.md)
- [예산 기능 PRD](../docs/design/prd-ms1-budget.md)
- [CLAUDE.md](../CLAUDE.md)
