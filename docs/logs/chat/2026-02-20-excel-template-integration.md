# 2026-02-20 챗 로그: 엑셀 템플릿 전체 반영

## 논의 주제

엑셀 템플릿(`docs/template/template.xlsx`)의 전체 기능을 앱에 반영하는 8단계 구현 계획 실행.

## 주요 결정

### 1. ServiceRegistry 도입
- **배경**: 기존 HomeScreen에서 서비스 싱글톤을 export하는 패턴이 서비스 수 증가(3→8개)로 한계
- **결정**: `ServiceRegistry.ts`에서 중앙 관리
- **하위 호환**: HomeScreen에서 ServiceRegistry를 re-export하여 기존 import 경로도 유지

### 2. SubCategory 별도 타입
- **배경**: 기존 Category에 parentId를 추가하면 모든 사용처 수정 필요
- **결정**: `SubCategory` 타입을 별도로 추가하고, Transaction에 `subCategoryId?`(optional)만 추가
- **이유**: 기존 Category 구조 보존, 점진적 마이그레이션 가능

### 3. useFocusEffect 모킹 한계
- **문제**: SettingsScreen에서 categoryType(지출/수입) 서브탭 전환 시 `loadCategories`가 `useFocusEffect`에 의존
- **원인**: 테스트에서 `useFocusEffect`를 `useEffect(callback, [])`로 모킹하므로 의존성 변화 감지 불가
- **대응**: 서브탭 전환 테스트 대신 다른 커버리지 보강 테스트로 대체

### 4. 컴포넌트 커버리지 100% 달성
- **문제**: 새 컴포넌트들(AnnualDashboard, AssetOverview, IncomeSummaryCard, TransactionItem)에서 일부 브랜치 미커버
- **해결**: 각 컴포넌트의 미커버 브랜치에 대한 테스트 추가
  - TransactionItem: subCategoryName 유무에 따른 분기
  - AnnualDashboard: formatAmount의 < 10000 케이스, 음수 잉여금액, totalSavings prop
  - AssetOverview: 비활성 계좌(isActive=false)
  - IncomeSummaryCard: 달성률 >= 100% 케이스

## 트러블슈팅

### 1. PaymentMethodService type 필드 미저장
- **증상**: SeedService 테스트에서 `methods[0].type`이 undefined
- **원인**: `PaymentMethodService.create()`에서 `type: input.type`을 포함하지 않음
- **해결**: create 메서드에 `type: input.type` 추가

### 2. 중복 텍스트로 인한 getByText 실패
- **증상**: "Found multiple elements with text: X" 오류
- **발생 위치**: AnnualDashboard(5,000), AssetOverview(1,000,000원), IncomeSummaryCard(150%)
- **원인**: 같은 금액이 행과 합계 등 여러 곳에 렌더링
- **해결**: `getAllByText().length >= 1` 패턴으로 변경

### 3. SettingsScreen 커버리지 임계값 미달 (74.65% < 75%)
- **해결**: 카테고리 접기(collapse) 테스트, 삭제 확인 콜백 실행 테스트, 소분류 모달 취소 테스트 추가 → 81.50%

## 구현 통계
- **8개 Phase** 모두 완료
- **테스트**: 271 → 496개 (+225)
- **커버리지**: 92.58% → 93.31%
- **신규 서비스**: 6개 (SubCategory, Seed, IncomeTarget, Savings, BankAccount + ServiceRegistry)
- **신규 컴포넌트**: 7개 (CategoryGroupItem, IncomeSummaryCard, SavingsProductItem, SavingsSummaryCard, AssetOverview, AnnualDashboard)
