# 챗 로그 - 2026-02-06: 날짜 선택 기능 + 등록 후 플로우 개선

## 논의 주제
- AddTransactionScreen에 날짜 선택 기능 추가
- 거래 등록 후 해당 날짜의 캘린더 뷰로 이동하는 플로우 구현

## 주요 결정

### 기존 컴포넌트 재활용 전략
- **DayCell/CalendarGrid에 `selectable` prop 추가** — DatePickerModal에서 재사용하기 위해
- 기존 동작은 깨뜨리지 않고 optional props로 확장 (backward compatible)

### DateSelector UI 설계
- "오늘" / "어제" / "직접 선택" 3버튼 구성
- 가장 빈번한 사용 패턴(오늘/어제)을 원탭으로 처리
- "직접 선택"은 DatePickerModal로 연결

### 등록 후 내비게이션 플로우
- `navigation.navigate('Home', { selectedDate: 'YYYY-MM-DD' })` 방식
- HomeScreen에서 `useEffect`로 파라미터 감지 → 캘린더 뷰 전환 + DayDetailModal 자동 열기
- 파라미터 소비 후 `setParams({ selectedDate: undefined })`로 클리어 (중복 실행 방지)

### Navigation 타입
- `Home: { selectedDate?: string } | undefined` — Date 객체 대신 문자열 사용
- 이유: React Navigation 파라미터는 직렬화 가능해야 함

## 트러블슈팅

### Alert 콜백 내 상태 업데이트
- 테스트에서 Alert의 "계속 등록하기" 콜백 실행 후 상태가 반영되지 않는 문제
- **해결**: `act(() => { continueButton.onPress(); })` 으로 감싸서 React 상태 업데이트 flush

### 커버리지 임계값 미충족
- DatePickerModal의 "12월→1월" 연도 경계 로직이 테스트되지 않음 (lines 44-45)
- **해결**: December에서 next month 이동하는 테스트 케이스 추가

## 구현 순서 (TDD 7단계)
1. DayCell `selectable`/`isSelected` props → RED → GREEN
2. CalendarGrid `selectable`/`selectedDay` 전달 → RED → GREEN
3. DatePickerModal 신규 컴포넌트 → RED → GREEN
4. DateSelector 신규 컴포넌트 → RED → GREEN
5. Navigation 타입 수정
6. AddTransactionScreen 수정 → RED → GREEN
7. HomeScreen 라우트 파라미터 처리 → RED → GREEN

## 최종 결과
- 228개 테스트 전체 통과
- 커버리지: 91.54% (신규 컴포넌트 100%)
