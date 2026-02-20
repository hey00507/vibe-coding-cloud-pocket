# 2026-02-20 차트 시각화 구현

## 논의 주제
엑셀 템플릿의 차트를 앱에 구현하는 작업

## 주요 결정

### 라이브러리 선택: react-native-svg (커스텀 차트)
- react-native-chart-kit, victory-native 등 차트 라이브러리 대신 react-native-svg만 사용
- 이유:
  - 차트 2종류(도넛, 막대)뿐이라 라이브러리 오버헤드 불필요
  - 100% 테스트 커버리지 달성 용이 (SVG props 직접 검증)
  - Expo 54 공식 호환, 가벼운 번들 사이즈

### 엑셀 템플릿 차트 분석
- 2026 시트에 2개 차트 존재:
  1. DoughnutChart: 카테고리별 지출 비율 (고정비, 식비 등 10개)
  2. BarChart: 월별 수입/저축/지출 비교 (12개월 clustered)
- 월별 시트에는 차트 없음 (텍스트 요약만)

### 차트 배치
- 월별 뷰: DonutChart → BreakdownList 순서
- 연도별 뷰: GroupedBarChart → BreakdownList 순서

### SVG 도넛 구현 기법
- `<Circle>` 컴포넌트에 strokeDasharray/strokeDashoffset 사용
- rotation으로 시작 위치 조정 (누적 퍼센트 기반)
- Path 기반 아크 대비 구현이 간단하고 테스트 용이

### useFocusEffect 한계 보완
- useFocusEffect 모킹은 deps를 `[]`로 고정하여 상태 변경 감지 불가
- `useEffect`를 별도 추가하여 periodType/year/month 변경 시 데이터 재로드
- 프로덕션에서는 두 효과 모두 작동 (화면 포커스 + 상태 변경)

## 트러블슈팅

### SVG 모킹 문제
- 문제: `jest.mock('react-native-svg')` 초기 설정에서 "Element type is invalid: got object" 에러
- 원인: `mocks.default = mocks.Svg`로 설정했지만 ESM default export가 제대로 처리되지 않음
- 해결: `__esModule: true` 플래그 추가 + 각 컴포넌트를 `displayName` 포함 함수형으로 생성

### 중복 텍스트 테스트 문제
- 문제: DonutChart 범례와 BreakdownList에 동일 카테고리명이 표시되어 `getByText` 실패
- 해결: `getAllByText().length >= 1` 패턴으로 변경 (기존 프로젝트 패턴과 동일)
