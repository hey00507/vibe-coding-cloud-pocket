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

/** batchGet 응답 생성 */
function createBatchGetResponse(valuesArrays: (string | number | null)[][][]) {
  return createSuccessResponse({
    valueRanges: valuesArrays.map((values) => ({ values })),
  });
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
    it('exportAll - batchUpdate로 1번 호출', async () => {
      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportAll();

      expect(result.status).toBe('success');
      expect(result.message).toContain('전체 내보내기 완료');

      // batchUpdate는 POST + batchUpdate URL
      const batchCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      expect(batchCalls).toHaveLength(1); // 설정+거래 전부 1번 호출
    });

    it('exportTransactions - 지출 거래 올바른 행 변환', async () => {
      const mockDate = new Date(2026, 2, 15);
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

      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportTransactions(2026, 3);

      expect(result.status).toBe('success');

      // batchWrite POST 호출 확인
      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      expect(postCalls.length).toBe(1);

      const body = JSON.parse((postCalls[0][1] as RequestInit).body as string);
      // data[0]은 expense range
      expect(body.data[0].values[0]).toEqual([
        15,
        '식비',
        '🍔외식',
        15000,
        '신한카드',
        '점심',
      ]);
    });

    it('exportTransactions - categoryId → name 변환', async () => {
      const mockDate = new Date(2026, 0, 10);
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

      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      const body = JSON.parse((postCalls[0][1] as RequestInit).body as string);
      expect(body.data[0].values[0][1]).toBe('문화생활');
    });

    it('exportTransactions - 수입 거래 카테고리별 합산', async () => {
      const date1 = new Date(2026, 0, 5);
      const date2 = new Date(2026, 0, 20);
      mockTransactionService.getAll.mockReturnValue([
        { id: 't1', type: 'income', amount: 3000000, date: date1, categoryId: 'icat1', paymentMethodId: 'pm1' },
        { id: 't2', type: 'income', amount: 500000, date: date2, categoryId: 'icat1', paymentMethodId: 'pm1' },
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

      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      const body = JSON.parse((postCalls[0][1] as RequestInit).body as string);
      // data[1]은 income range
      const incomeData = body.data.find((d: any) =>
        d.range.includes('C14')
      );
      expect(incomeData).toBeDefined();
      expect(incomeData.values[0][0]).toBe('급여');
      expect(incomeData.values[0][1]).toBe(3500000);
    });

    it('exportTransactions - 빈 월도 패딩으로 batchWrite 호출', async () => {
      mockTransactionService.getAll.mockReturnValue([]);
      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportTransactions(2026, 6);

      expect(result.status).toBe('success');
      // batchWrite는 항상 호출됨 (빈 행 패딩)
      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      expect(postCalls).toHaveLength(1);
    });

    it('exportSettings - batchUpdate로 카테고리+결제수단 1번 호출', async () => {
      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockSubCategoryService.getAll.mockReturnValue([
        { id: 'sub1', categoryId: 'cat1', name: '외식', icon: '🍔' },
        { id: 'sub2', categoryId: 'cat1', name: '카페', icon: '☕' },
      ]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '신한카드', type: 'credit' },
      ]);

      mockFetch.mockResolvedValue(createSuccessResponse());

      const result = await service.exportSettings();

      expect(result.status).toBe('success');

      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit]) =>
          opts.method === 'POST' && url.includes('batchUpdate')
      );
      expect(postCalls).toHaveLength(1);

      const body = JSON.parse((postCalls[0][1] as RequestInit).body as string);
      // 3개 범위: categories, credit, debit
      expect(body.data).toHaveLength(3);

      const categoryData = body.data.find((d: any) => d.range.includes('E41'));
      expect(categoryData.values[0]).toEqual(['식비', '🍔외식', '☕카페']);
      expect(categoryData.values.length).toBe(10); // 패딩 포함
    });

    it('exportSettings - 카테고리 비어있으면 에러', async () => {
      mockCategoryService.getByType.mockReturnValue([]);

      const result = await service.exportSettings();

      expect(result.status).toBe('error');
      expect(result.message).toContain('카테고리가 없습니다');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('exportAll - 인증 없으면 에러', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      await expect(service.exportAll()).rejects.toThrow('인증이 필요합니다');
    });
  });

  // ========== Import (8) ==========
  describe('Import', () => {
    it('importAll - batchGet으로 1번 호출', async () => {
      // batchGet: 3(설정) + 24(12개월 x 2) = 27개 범위를 1번에 읽기
      const emptyRanges = Array(27).fill([]);
      mockFetch.mockResolvedValueOnce(createBatchGetResponse(emptyRanges));

      const result = await service.importAll();

      expect(result.status).toBe('success');
      expect(result.message).toContain('전체 가져오기 완료');

      // batchGet은 GET 호출 1번
      const getCalls = mockFetch.mock.calls.filter(
        ([url]: [string]) => url.includes('batchGet')
      );
      expect(getCalls).toHaveLength(1);
    });

    it('importTransactions - 시트 행 → Transaction 변환', async () => {
      const expenseValues = [[15, '식비', '🍔외식', 15000, '신한카드', '점심']];

      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
      mockSubCategoryService.getByCategoryId.mockReturnValue([
        { id: 'sub1', categoryId: 'cat1', name: '외식', icon: '🍔' },
      ]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '신한카드' },
      ]);

      // batchGet: [expense, income]
      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([expenseValues, []])
      );

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
      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
        { id: 'cat2', name: '교통', type: 'expense' },
      ]);
      mockSubCategoryService.getByCategoryId.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([
        { id: 'pm1', name: '현금' },
      ]);

      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([[[10, '교통', '', 3000, '현금', '']], []])
      );

      await service.importTransactions(2026, 1);

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.categoryId).toBe('cat2');
    });

    it('importTransactions - 없는 카테고리 자동 생성', async () => {
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

      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([[[5, '새카테고리', '', 20000, '현금', '']], []])
      );

      await service.importTransactions(2026, 1);

      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: '새카테고리',
        type: 'expense',
      });

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.categoryId).toBe('new-cat');
    });

    it('importTransactions - 이모지 포함 소분류 파싱', async () => {
      mockCategoryService.getByType.mockReturnValue([
        { id: 'cat1', name: '식비', type: 'expense' },
      ]);
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

      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([[[7, '식비', '🍕피자', 25000, '카드', '']], []])
      );

      await service.importTransactions(2026, 1);

      expect(mockSubCategoryService.create).toHaveBeenCalledWith({
        categoryId: 'cat1',
        name: '피자',
        icon: '🍕',
      });

      const createArg = mockTransactionService.create.mock.calls[0][0];
      expect(createArg.subCategoryId).toBe('new-sub');
    });

    it('importSettings - batchGet으로 카테고리+결제수단 1번 읽기', async () => {
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

      // batchGet: [categories, credit, debit]
      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([
          [['식비', '🍔외식', '☕카페']], // categories
          [],                              // credit cards
          [],                              // debit cards
        ])
      );

      const result = await service.importSettings();

      expect(result.status).toBe('success');
      expect(mockCategoryService.create).toHaveBeenCalledWith({
        name: '식비',
        type: 'expense',
      });
      expect(mockSubCategoryService.create).toHaveBeenCalledTimes(2);
    });

    it('importSettings - 결제수단 파싱 (열별 그룹)', async () => {
      mockCategoryService.getByType.mockReturnValue([]);
      mockPaymentMethodService.getAll.mockReturnValue([]);
      mockPaymentMethodService.create.mockImplementation((input) => ({
        id: `pm-${input.name}`,
        ...input,
      }));

      // batchGet: [categories (empty), credit, debit]
      mockFetch.mockResolvedValueOnce(
        createBatchGetResponse([
          [],                        // categories
          [['신한카드']],             // credit
          [['현대카드'], ['현금']],   // debit
        ])
      );

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
