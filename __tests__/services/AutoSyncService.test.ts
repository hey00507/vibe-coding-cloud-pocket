import { AutoSyncService } from '../../src/services/AutoSyncService';

describe('AutoSyncService', () => {
  let service: AutoSyncService;
  let mockAuthService: any;
  let mockSheetsService: any;

  beforeEach(() => {
    jest.useFakeTimers();

    mockAuthService = {
      isSignedIn: jest.fn().mockReturnValue(false),
      hydrate: jest.fn().mockResolvedValue(undefined),
    };

    mockSheetsService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getSpreadsheetId: jest.fn().mockReturnValue(null),
      getLastSyncTime: jest.fn().mockReturnValue(null),
      exportAll: jest.fn().mockResolvedValue({ status: 'success', message: 'ok' }),
    };

    service = new AutoSyncService({
      authService: mockAuthService,
      sheetsService: mockSheetsService,
      minIntervalMs: 6 * 60 * 60 * 1000, // 6시간
    });
  });

  afterEach(() => {
    service.stopListening();
    jest.useRealTimers();
  });

  describe('shouldSync', () => {
    it('should return false when not signed in', () => {
      mockAuthService.isSignedIn.mockReturnValue(false);
      expect(service.shouldSync()).toBe(false);
    });

    it('should return false when no spreadsheet ID', () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue(null);
      expect(service.shouldSync()).toBe(false);
    });

    it('should return true when signed in, has spreadsheet ID, and never synced', () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);
      expect(service.shouldSync()).toBe(true);
    });

    it('should return false when last sync is within interval', () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      // 1시간 전 동기화
      mockSheetsService.getLastSyncTime.mockReturnValue(new Date(Date.now() - 1 * 60 * 60 * 1000));
      expect(service.shouldSync()).toBe(false);
    });

    it('should return true when last sync exceeds interval', () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      // 7시간 전 동기화
      mockSheetsService.getLastSyncTime.mockReturnValue(new Date(Date.now() - 7 * 60 * 60 * 1000));
      expect(service.shouldSync()).toBe(true);
    });
  });

  describe('syncIfNeeded', () => {
    it('should not sync when conditions not met', async () => {
      mockAuthService.isSignedIn.mockReturnValue(false);

      const result = await service.syncIfNeeded();

      expect(result).toBe(false);
      expect(mockSheetsService.exportAll).not.toHaveBeenCalled();
    });

    it('should sync when conditions met', async () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);

      const result = await service.syncIfNeeded();

      expect(result).toBe(true);
      expect(mockSheetsService.exportAll).toHaveBeenCalledTimes(1);
    });

    it('should update last result on success', async () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);

      await service.syncIfNeeded();

      const lastResult = service.getLastAutoSyncResult();
      expect(lastResult.success).toBe(true);
      expect(lastResult.timestamp).not.toBeNull();
    });

    it('should update last result on failure', async () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);
      mockSheetsService.exportAll.mockRejectedValue(new Error('Network error'));

      await service.syncIfNeeded();

      const lastResult = service.getLastAutoSyncResult();
      expect(lastResult.success).toBe(false);
      expect(lastResult.error).toBe('Network error');
    });

    it('should not sync twice within interval', async () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);

      await service.syncIfNeeded();

      // 두 번째 호출 - lastSyncTime이 방금으로 설정됨
      mockSheetsService.getLastSyncTime.mockReturnValue(new Date());

      const result2 = await service.syncIfNeeded();
      expect(result2).toBe(false);
      expect(mockSheetsService.exportAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('initializeAndSync', () => {
    it('should hydrate auth and initialize sheets before syncing', async () => {
      mockAuthService.isSignedIn.mockReturnValue(true);
      mockSheetsService.getSpreadsheetId.mockReturnValue('sheet-123');
      mockSheetsService.getLastSyncTime.mockReturnValue(null);

      await service.initializeAndSync();

      expect(mockAuthService.hydrate).toHaveBeenCalled();
      expect(mockSheetsService.initialize).toHaveBeenCalled();
      expect(mockSheetsService.exportAll).toHaveBeenCalled();
    });
  });

  describe('getLastAutoSyncResult', () => {
    it('should return default state when no sync has occurred', () => {
      const result = service.getLastAutoSyncResult();
      expect(result.success).toBe(false);
      expect(result.timestamp).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });
});
