# 챗 로그 - 2026-02-06: 통계 페이지 (Statistics Tab) 구현

## 논의 주제
- 월별/연도별 수입·지출 통계 화면 (4번째 탭) 구현
- 카테고리별, 결제수단별 지출 비중(금액 + 비율) 표시

## 주요 결정

### 구현 순서 (6단계 TDD)
1. 타입 정의 + Navigation 수정
2. TransactionService 집계 메서드 4개 (getMonthlySummary, getYearlySummary, getCategoryBreakdown, getPaymentMethodBreakdown)
3. PeriodSelector 컴포넌트 (월별/연도별 토글 + 기간 네비게이션)
4. BreakdownList 컴포넌트 (아이콘+이름, 건수, 금액, 비율 바)
5. StatisticsScreen (조합 화면)
6. App.tsx 탭 추가

### 아키텍처 결정
- **서비스에서 raw 데이터 반환**: CategoryBreakdown에는 categoryId만 포함, 이름/아이콘은 화면에서 조회
- **BreakdownItem 타입**: 화면 표시용 타입은 BreakdownList 컴포넌트에 정의 (서비스 타입과 분리)
- **SummaryCard 재사용**: 기존 홈 화면의 SummaryCard를 그대로 재사용
- **탭 순서**: 홈 → 추가 → 통계 → 설정 (통계를 설정 앞에 배치)

### percentage 계산
- `Math.round((amount / totalAmount) * 100)` 사용
- 반올림 특성상 합이 99% 또는 101%가 될 수 있음 (허용)

## 트러블슈팅

### Branch coverage 부족 (50% → 75%)
- **문제**: StatisticsScreen의 branch coverage가 50%로 75% threshold 미달
- **원인**: yearly 모드의 날짜 범위 분기, 연도별 prev/next, 월 경계 래핑(1월→12월, 12월→1월)이 테스트되지 않음
- **해결**: yearly 모드 네비게이션 테스트 4개 추가 (연도별 prev/next, 월 경계 래핑)
- **결과**: branch coverage 50% → 75% 달성
