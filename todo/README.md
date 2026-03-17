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

### 핵심 원칙
- **도메인 단위 개발**: 기능을 도메인별로 분리하여 독립적으로 개발
- **인터페이스 기반 설계**: 서비스는 항상 인터페이스를 먼저 정의
- **Excel 템플릿 기준**: 모든 기능은 기존 Excel 가계부 템플릿 구조에 맞춰 구현

---

## 프로젝트 목표

**기존 Excel 가계부 템플릿을 모바일 앱으로 시각화하고, 시트별 편의 기능을 100% 활용하는 것.**

템플릿 구조:
- **설정 시트**: 카테고리(대/소분류), 결제수단, 수입항목, 저축상품, 은행계좌
- **월별 시트 (1~12월)**: 수입 상세(Area B), 저축 상세(Area C), 거래 입력(Area D), 카테고리 집계(Area E), 캘린더(Area F)
- **연간 대시보드**: 12개월 × 항목별 매트릭스 요약

연동 스프레드시트: `1SVWtvuUux5WCXSS-MycaU8bzWnFHzBOy`

---

## 진행 상황 요약

| Phase | 상태 | 설명 | 테스트 |
|-------|------|------|--------|
| Phase 1 | ✅ 완료 | MVP 기본 가계부 | 661개 통과 |
| Phase 1.5 | ✅ 완료 | 테마 시스템 + 캘린더 뷰 | 포함 |
| Phase 2 | ✅ 완료 | AsyncStorage 영속화 (전 서비스) | 포함 |
| Phase 3 | ✅ 완료 | Google Sheets 연동 (GCP + OAuth + 실기기 검증) | 포함 |
| MS1 | ✅ 완료 | 예산 기능 (카테고리별 월 예산 + 소진률) | 705개 통과 |
| **MS2** | ⏳ 다음 | 자동 동기화 (앱 시작/백그라운드) | - |
| MS3 | 대기 | Xcode 빌드 + AltStore 배포 | - |
| MS4 | 대기 | iOS 위젯 (WidgetKit, Swift) | - |
| MS5 | 대기 | 수입/저축/자산 관리 UI | - |
| MS6 | 대기 | 연도 전환 자동화 + 추가 위젯 | - |

---

## Phase 구성

### Phase 1~2: MVP + 영속화 ✅ 완료
- 수입/지출 거래 CRUD
- 캘린더 뷰 (월별 일일 잔액)
- 리스트 뷰 (일별 거래 내역)
- 통계 (DonutChart, GroupedBarChart, AnnualDashboard)
- AsyncStorage 영속화 (7개 서비스)
- Light/Dark/System 테마
- 카테고리/소카테고리 관리 UI
- 결제수단 관리 UI
- 95.11% 테스트 커버리지

### Phase 1.5: 테마 + 캘린더 ✅ 완료
- ThemeProvider + useTheme 훅
- 30+ 색상 토큰, 4개 화면 + 18개 컴포넌트 적용
- CalendarGrid 완성

### [Phase 3: Google Sheets 연동](./phase3-google-sheets.md)
기존 Excel 템플릿 스프레드시트와 수동 백업/복원

**현재 상태**: 코드 완료, GCP 설정 미완

### [Phase 4: 템플릿 완전 활용](./phase4-template.md)
서비스는 있지만 UI가 없는 기능들의 화면 구현 + 시각화 강화

---

## 서비스 현황

| 서비스 | 구현 | 테스트 | UI 연결 |
|--------|------|--------|---------|
| TransactionService | ✅ | ✅ | ✅ |
| CategoryService | ✅ | ✅ | ✅ |
| SubCategoryService | ✅ | ✅ | ✅ |
| PaymentMethodService | ✅ | ✅ | ✅ |
| SavingsService | ✅ | ✅ | 🔴 UI 없음 |
| BankAccountService | ✅ | ✅ | 🔴 UI 없음 |
| IncomeTargetService | ✅ | ✅ | 🔴 UI 없음 |
| BudgetService | ✅ | ✅ (100%) | ✅ |
| GoogleAuthService | ✅ | ✅ | 🔴 placeholder |
| GoogleSheetsService | ✅ | ✅ | 🔴 placeholder |
| StorageService | ✅ | ✅ | ✅ |
| AppInitializer | ✅ | ✅ | ✅ |

---

## 참고 문서

- [설계 문서](../docs/design/2026-02-04-initial.md)
- [데이터 아키텍처](../docs/design/data-architecture.md)
- [Google Sheets 스키마](../docs/design/google-sheets-schema.md)
- [CLAUDE.md](../CLAUDE.md)
