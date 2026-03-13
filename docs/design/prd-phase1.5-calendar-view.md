# PRD: 캘린더 뷰 (Phase 1.5)

> 작성일: 2026-03-13
> 상태: ✅ 구현 완료 (잔여 개선사항 정리)

---

## 1. 현재 구현 상태

### 완료된 항목
| 컴포넌트 | 파일 | 상태 |
|---------|------|------|
| ViewToggle | `src/views/components/ViewToggle.tsx` | ✅ 완료 |
| CalendarHeader | `src/views/components/CalendarHeader.tsx` | ✅ 완료 |
| CalendarGrid | `src/views/components/CalendarGrid.tsx` | ✅ 완료 |
| DayCell | `src/views/components/DayCell.tsx` | ✅ 완료 |
| DayDetailModal | `src/views/components/DayDetailModal.tsx` | ✅ 완료 |
| HomeScreen 통합 | `src/views/screens/HomeScreen.tsx` | ✅ 완료 |
| getDailySummaries | `TransactionService` | ✅ 완료 |
| getByDate | `TransactionService` | ✅ 완료 |

### 구현된 기능
- 리스트/캘린더 뷰 토글 전환
- 월 네비게이션 (이전/다음)
- 월별 요약 (수입/지출/잔액)
- 6주 × 7일 캘린더 그리드
- 날짜별 잔액 표시 (초록: 양수, 빨강: 음수)
- 날짜 선택 시 DayDetailModal (거래 목록 + 카테고리/결제수단 표시)
- AddTransactionScreen에서 선택된 날짜로 캘린더 뷰 자동 전환
- Pull-to-Refresh 지원

---

## 2. 잔여 개선사항 (Optional)

아래는 현재 스코프에 포함하지 않으나 향후 개선 가능한 항목:

### 2.1 UX 개선
| 항목 | 설명 | 우선순위 |
|------|------|---------|
| 오늘 버튼 | 다른 월 탐색 후 오늘로 빠르게 복귀 | Low |
| 스와이프 제스처 | 좌우 스와이프로 월 전환 | Low |
| DayDetailModal → 거래 추가 | 모달 내 "+" 버튼으로 해당 날짜 거래 바로 추가 | Medium |
| DayDetailModal → 거래 편집 | 거래 항목 탭하여 수정 화면 이동 | Medium |

### 2.2 결론
캘린더 뷰는 설계 문서(calendar-view.md) 기준 **100% 구현 완료**. Phase 1.5의 나머지 작업은 **테마 시스템**만 남아있음.
