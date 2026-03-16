import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSheetsService } from '../../src/services/GoogleSheetsService';

// ========== Mock Services ==========
const mockTransactionService = {
  getAll: jest.fn().mockReturnValue([]),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockCategoryService = {
  getAll: jest.fn().mockReturnValue([]),
  getByType: jest.fn().mockReturnValue([]),
  create: jest.fn(),
};

const mockSubCategoryService = {
  getAll: jest.fn().mockReturnValue([]),
  getByCategoryId: jest.fn().mockReturnValue([]),
  create: jest.fn(),
};

const mockPaymentMethodService = {
  getAll: jest.fn().mockReturnValue([]),
  create: jest.fn(),
};

// ========== Mock fetch ==========
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ========== Helpers ==========
function createSuccessResponse(data: object = {}) {
  return { ok: true, status: 200, json: async () => data };
}

function createErrorResponse(status: number = 400) {
  return { ok: false, status, json: async () => ({ error: 'error' }) };
}

const MOCK_TOKEN = 'mock-access-token';
const MOCK_SPREADSHEET_ID = 'spreadsheet-123';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockGetAccessToken: jest.Mock;

  beforeEach(async () => {
    await AsyncStorage.clear();
    mockFetch.mockReset();
    mockGetAccessToken = jest.fn().mockResolvedValue(MOCK_TOKEN);

    // Reset all service mocks
    mockTransactionService.getAll.mockReturnValue([]);
    mockTransactionService.create.mockReset();
    mockTransactionService.delete.mockReset();
    mockCategoryService.getAll.mockReturnValue([]);
    mockCategoryService.getByType.mockReturnValue([]);
    mockCategoryService.create.mockReset();
    mockSubCategoryService.getAll.mockReturnValue([]);
    mockSubCategoryService.getByCategoryId.mockReturnValue([]);
    mockSubCategoryService.create.mockReset();
    mockPaymentMethodService.getAll.mockReturnValue([]);
    mockPaymentMethodService.create.mockReset();

    service = new GoogleSheetsService({
      getAccessToken: mockGetAccessToken,
      transactionService: mockTransactionService as any,
      categoryService: mockCategoryService as any,
      subCategoryService: mockSubCategoryService as any,
      paymentMethodService: mockPaymentMethodService as any,
    });
    await service.setSpreadsheetId(MOCK_SPREADSHEET_ID);
  });

  // ========== Basic API (6) ==========
  describe('Basic API', () => {
    it('readRange - 정상 데이터 반환', async () => {
      const mockValues = [
        [1, '식비', '🍔햄버거', 15000, '카드', '점심'],
        [2, '교통', '', 3000, '카드', ''],
      ];
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({ values: mockValues })
      );

      const result = await service.readRange("'1월'!F6:K1000");

      expect(result).toEqual(mockValues);
      expect(result).toHaveLength(2);
    });

    it('readRange - 빈 시트 빈 배열 반환', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse({}));

      const result = await service.readRange("'1월'!F6:K1000");

      expect(result).toEqual([]);
    });

    it('writeRange - 데이터 쓰기 성공', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse());

      const values = [[1, '식비', 15000]];
      await service.writeRange("'1월'!F6:K1000", values);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('valueInputOption=USER_ENTERED');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body)).toEqual({ values });
    });

    it('clearRange - 범위 클리어 성공', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse());

      await service.clearRange("'1월'!F6:K1000");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain(':clear');
      expect(options.method).toBe('POST');
    });

    it('API 호출 시 accessToken 헤더 포함', async () => {
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({ values: [] })
      );

      await service.readRange("'1월'!F6:K1000");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    });

    it('401 에러 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(401));

      await expect(service.readRange("'1월'!F6:K1000")).rejects.toThrow(
        '인증이 만료되었습니다'
      );
    });
  });

  // ========== Export (8) ==========
  describe('Export', () => {
    it('exportAll - 전체 내보내기 성공', async () => {
      // exportSettings: clear categories, clear payment methods
      // exportTransactions: clear expense, clear income
      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportAll();

      expect(result.status).toBe('success');
      expect(result.message).toContain('전체 내보내기 완료');
    });

    it('exportTransactions - 지출 거래 올바른 행 변환', async () => {
      const mockDate = new Date(2026, 2, 15); // 2026년 3월 15일
      mockTransactionService.getAll.mockReturnValue([
        {
          id: 't1',
          type: 'expense',
          amount: 15000,
          date: mockDate,
          categoryId: 'cat1',
          subCategoryId: 'sub1',
          paymentMethodId: 'pm1',
          memo: '점심',
        },
      ]);

      mockCategoryService.getAll.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockSubCategoryService.getAll.mockReturnValue([
        { id: 'sub1', categoryId: 'cat1', name: '외식', icon: '🍔' },
      ]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '신한카드' },
      ]);

      // clear expense + write expense + clear income (no income write)
      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportTransactions(2026, 3);

      expect(result.status).toBe('success');

      // writeRange 호출 확인 - PUT 요청 찾기
      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThanOrEqual(1);

      const [, putOptions] = putCalls[0];
      const body = JSON.parse((putOptions as RequestInit).body as string);
      // [day, categoryName, subCategoryIcon+Name, amount, paymentMethodName, memo]
      expect(body.values[0]).toEqual([
        15,
        '식비',
        '🍔외식',
        15000,
        '신한카드',
        '점심',
      ]);
    });

    it('exportTransactions - categoryId → name 변환', async () => {
      const mockDate = new Date(2026, 0, 10); // 2026년 1월 10일
      mockTransactionService.getAll.mockReturnValue([
        {
          id: 't1',
          type: 'expense',
          amount: 50000,
          date: mockDate,
          categoryId: 'cat2',
          paymentMethodId: 'pm1',
        },
      ]);
      mockCategoryService.getAll.mockReturnValue([
        { id: 'cat2', name: '문화생활', type: 'expense' },
      ]);
      mockSubCategoryService.getAll.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '현금' },
      ]);

      mockFetch.mockResolvedValue(createSuccessResponse());

      await service.exportTransactions(2026, 1);

      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThanOrEqual(1);

      const body = JSON.parse((putCalls[0][1] as RequestInit).body as string);
      expect(body.values[0][1]).toBe('문화생활');
    });

    it('exportTransactions - 수입 거래 카테고리별 합산', async () => {
      const date1 = new Date(2026, 0, 5);
      const date2 = new Date(2026, 0, 20);
      mockTransactionService.getAll.mockReturnValue([
        {
          id: 't1',
          type: 'income',
          amount: 3000000,
          date: date1,
          categoryId: 'icat1',
          paymentMethodId: 'pm1',
        },
        {
          id: 't2',
          type: 'income',
          amount: 500000,
          date: date2,
          categoryId: 'icat1',
          paymentMethodId: 'pm1',
        },
      ]);
      mockCategoryService.getAll.mockReturnValue([
        { id: 'icat1', name: '급여', type: 'income' },
      ]);
      mockSubCategoryService.getAll.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '계좌' },
      ]);

      mockFetch.mockResolvedValue(createSuccessResponse());

      await service.exportTransactions(2026, 1);

      // 수입 write 확인 - income range에 대한 PUT
      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );
      // 수입 PUT 호출에서 합산 확인
      const incomeWrite = putCalls.find(([url]: [string]) =>
        decodeURIComponent(url).includes('B15')
      );
      expect(incomeWrite).toBeDefined();

      const body = JSON.parse((incomeWrite![1] as RequestInit).body as string);
      // 급여 카테고리에 3,500,000원 합산
      expect(body.values[0][0]).toBe('급여');
      expect(body.values[0][1]).toBe(3500000);
    });

    it('exportTransactions - 빈 월 처리', async () => {
      mockTransactionService.getAll.mockReturnValue([]);
      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportTransactions(2026, 6);

      expect(result.status).toBe('success');
      // clear는 호출되지만 write는 호출 안 됨
      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );
      expect(putCalls).toHaveLength(0);
    });

    it('exportSettings - 카테고리 매트릭스 변환', async () => {
      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockSubCategoryService.getAll.mockReturnValue([
        { id: 'sub1', categoryId: 'cat1', name: '외식', icon: '🍔' },
        { id: 'sub2', categoryId: 'cat1', name: '카페', icon: '☕' },
      ]);
      mockPaymentMethodService.getAll.mockReturnValue([]);

      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportSettings();

      expect(result.status).toBe('success');

      // 카테고리 매트릭스 PUT 확인
      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThanOrEqual(1);

      const categoryWrite = putCalls.find(([url]: [string]) =>
        decodeURIComponent(url).includes('D38')
      );
      expect(categoryWrite).toBeDefined();

      const body = JSON.parse(
        (categoryWrite![1] as RequestInit).body as string
      );
      // [대분류명, 소분류1, 소분류2]
      expect(body.values[0]).toEqual(['식비', '🍔외식', '☕카페']);
    });

    it('exportSettings - 결제수단 변환', async () => {
      mockCategoryService.getByType.mockReturnValue([]);
      mockSubCategoryService.getAll.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '신한카드', type: 'credit' },
        { id: 'pm2', name: '현금', type: 'cash' },
      ]);

      mockFetch.mockResolvedValue(createSuccessResponse());

      await service.exportSettings();

      const putCalls = mockFetch.mock.calls.filter(
        ([, opts]: [string, RequestInit]) => opts.method === 'PUT'
      );

      // 신용카드는 PAYMENT_CREDIT 범위에 기록
      const creditWrite = putCalls.find(([url]: [string]) =>
        decodeURIComponent(url).includes('B12')
      );
      expect(creditWrite).toBeDefined();
      const creditBody = JSON.parse((creditWrite![1] as RequestInit).body as string);
      expect(creditBody.values).toEqual([['신한카드']]);

      // 현금은 PAYMENT_DEBIT 범위에 기록
      const debitWrite = putCalls.find(([url]: [string]) =>
        decodeURIComponent(url).includes('C12')
      );
      expect(debitWrite).toBeDefined();
      const debitBody = JSON.parse((debitWrite![1] as RequestInit).body as string);
      expect(debitBody.values).toEqual([['현금']]);
    });

    it('exportAll - 인증 없으면 에러', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      await expect(service.exportAll()).rejects.toThrow('인증이 필요합니다');
    });
  });

  // ========== Import (8) ==========
  describe('Import', () => {
    it('importAll - 전체 가져오기 성공', async () => {
      // readRange calls will return empty
      mockFetch.mockResolvedValue(createSuccessResponse({ values: [] }));

      const result = await service.importAll();

      expect(result.status).toBe('success');
      expect(result.message).toContain('전체 가져오기 완료');
    });

    it('importTransactions - 시트 행 → Transaction 변환', async () => {
      const expenseData = {
        values: [[15, '식비', '🍔외식', 15000, '신한카드', '점심']],
      };

      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockSubCategoryService.getByCategoryId.mockReturnValue([
        { id: 'sub1', categoryId: 'cat1', name: '외식', icon: '🍔' },
      ]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '신한카드' },
      ]);

      // First call: expense read, second: income read
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(expenseData))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }));

      const result = await service.importTransactions(2026, 3);

      expect(result.status).toBe('success');
      expect(mockTransactionService.create).toHaveBeenCalledTimes(1);

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.type).toBe('expense');
      expect(createArg.amount).toBe(15000);
      expect(createArg.categoryId).toBe('cat1');
      expect(createArg.subCategoryId).toBe('sub1');
      expect(createArg.paymentMethodId).toBe('pm1');
      expect(createArg.memo).toBe('점심');
    });

    it('importTransactions - 대분류 이름 → categoryId 매칭', async () => {
      const expenseData = {
        values: [[10, '교통', '', 3000, '현금', '']],
      };

      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
        { id: 'cat2', name: '교통', type: 'expense' },
      ]);
      mockSubCategoryService.getByCategoryId.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '현금' },
      ]);

      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(expenseData))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }));

      await service.importTransactions(2026, 1);

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.categoryId).toBe('cat2');
    });

    it('importTransactions - 없는 카테고리 자동 생성', async () => {
      const expenseData = {
        values: [[5, '새카테고리', '', 20000, '현금', '']],
      };

      // 기존 카테고리에 없음
      mockCategoryService.getByType.mockReturnValue([]);
      mockCategoryService.create.mockReturnValue({
        id: 'new-cat',
        name: '새카테고리',
        type: 'expense',
      });
      mockSubCategoryService.getByCategoryId.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([]);
      mockPaymentMethodService.create.mockReturnValue({
        id: 'new-pm',
        name: '현금',
      });

      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(expenseData))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }));

      await service.importTransactions(2026, 1);

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: '새카테고리',
        type: 'expense',
      });

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.categoryId).toBe('new-cat');
    });

    it('importTransactions - 이모지 포함 소분류 파싱', async () => {
      const expenseData = {
        values: [[7, '식비', '🍕피자', 25000, '카드', '']],
      };

      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      // 소분류 없음 → 자동 생성
      mockSubCategoryService.getByCategoryId.mockReturnValue([]);
      mockSubCategoryService.create.mockReturnValue({
        id: 'new-sub',
        categoryId: 'cat1',
        name: '피자',
        icon: '🍕',
      });
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '카드' },
      ]);

      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(expenseData))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }));

      await service.importTransactions(2026, 1);

      expect(mockSubCategoryService.create).toHaveBeenCalledWith({
        categoryId: 'cat1',
        name: '피자',
        icon: '🍕',
      });

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.subCategoryId).toBe('new-sub');
    });

    it('importSettings - 카테고리 매트릭스 파싱', async () => {
      const categoryData = {
        values: [['식비', '🍔외식', '☕카페']],
      };

      // 기존 카테고리 없음
      mockCategoryService.getByType.mockReturnValue([]);
      mockCategoryService.create.mockReturnValue({
        id: 'new-cat',
        name: '식비',
        type: 'expense',
      });
      mockSubCategoryService.getByCategoryId.mockReturnValue([]);
      mockSubCategoryService.create.mockImplementation((input) => ({
        id: `sub-${input.name}`,
        ...input,
      }));

      // categories, then credit cards, then debit/cash
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(categoryData))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }))
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }));

      const result = await service.importSettings();

      expect(result.status).toBe('success');
      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: '식비',
        type: 'expense',
      });
      expect(mockSubCategoryService.create).toHaveBeenCalledTimes(2);
      expect(mockSubCategoryService.create).toHaveBeenCalledWith({
        categoryId: 'new-cat',
        name: '외식',
        icon: '🍔',
      });
      expect(mockSubCategoryService.create).toHaveBeenCalledWith({
        categoryId: 'new-cat',
        name: '카페',
        icon: '☕',
      });
    });

    it('importSettings - 결제수단 파싱 (열별 그룹)', async () => {
      const creditData = { values: [['신한카드']] };
      const debitData = { values: [['현대카드'], ['현금']] };

      mockCategoryService.getByType.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([]);
      mockPaymentMethodService.create.mockImplementation((input) => ({
        id: `pm-${input.name}`,
        ...input,
      }));

      // categories (empty), then credit, then debit
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse({ values: [] }))
        .mockResolvedValueOnce(createSuccessResponse(creditData))
        .mockResolvedValueOnce(createSuccessResponse(debitData));

      const result = await service.importSettings();

      expect(result.status).toBe('success');
      expect(mockPaymentMethodService.create).toHaveBeenCalledTimes(3);
      expect(mockPaymentMethodService.create).toHaveBeenCalledWith({
        name: '신한카드',
        type: 'credit',
      });
      expect(mockPaymentMethodService.create).toHaveBeenCalledWith({
        name: '현대카드',
        type: 'debit',
      });
      expect(mockPaymentMethodService.create).toHaveBeenCalledWith({
        name: '현금',
        type: 'cash',
      });
    });

    it('importAll - 인증 없으면 에러', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      await expect(service.importAll()).rejects.toThrow('인증이 필요합니다');
    });
  });
});
