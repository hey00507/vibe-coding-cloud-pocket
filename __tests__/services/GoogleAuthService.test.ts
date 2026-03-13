import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthService } from '../../src/services/GoogleAuthService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const MOCK_AUTH_CODE = 'mock-auth-code-123';

const MOCK_TOKEN_RESPONSE = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
};

function createSuccessResponse(data: object) {
  return {
    ok: true,
    json: async () => data,
  };
}

function createErrorResponse() {
  return {
    ok: false,
    json: async () => ({ error: 'invalid_grant' }),
  };
}

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    mockFetch.mockReset();
    service = new GoogleAuthService();
  });

  describe('signIn', () => {
    it('성공 시 토큰을 반환하고 AsyncStorage에 저장한다', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));

      const tokens = await service.signIn(MOCK_AUTH_CODE);

      expect(tokens.accessToken).toBe('mock-access-token');
      expect(tokens.refreshToken).toBe('mock-refresh-token');
      expect(typeof tokens.expiresAt).toBe('number');
      expect(service.isSignedIn()).toBe(true);

      const stored = await AsyncStorage.getItem('@cloudpocket/googleAuthTokens');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).accessToken).toBe('mock-access-token');
    });

    it('실패 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse());

      await expect(service.signIn(MOCK_AUTH_CODE)).rejects.toThrow(
        'Failed to sign in with Google',
      );
      expect(service.isSignedIn()).toBe(false);
    });
  });

  describe('signOut', () => {
    it('signOut 후 isSignedIn()은 false를 반환한다', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));
      await service.signIn(MOCK_AUTH_CODE);
      expect(service.isSignedIn()).toBe(true);

      await service.signOut();

      expect(service.isSignedIn()).toBe(false);
      const stored = await AsyncStorage.getItem('@cloudpocket/googleAuthTokens');
      expect(stored).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('유효한 토큰이 있으면 accessToken을 반환한다', async () => {
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));
      await service.signIn(MOCK_AUTH_CODE);

      const token = await service.getAccessToken();

      expect(token).toBe('mock-access-token');
    });

    it('토큰이 없으면 null을 반환한다', async () => {
      const token = await service.getAccessToken();

      expect(token).toBeNull();
    });

    it('만료된 토큰이면 자동으로 refresh한다', async () => {
      // 먼저 로그인
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));
      await service.signIn(MOCK_AUTH_CODE);

      // 토큰 만료 시뮬레이션: expiresAt를 과거로 설정
      const stored = await AsyncStorage.getItem('@cloudpocket/googleAuthTokens');
      const tokens = JSON.parse(stored!);
      tokens.expiresAt = Date.now() - 1000; // 이미 만료
      await AsyncStorage.setItem('@cloudpocket/googleAuthTokens', JSON.stringify(tokens));

      // hydrate로 만료된 토큰 로드
      const freshService = new GoogleAuthService();
      await freshService.hydrate();

      // refresh 응답 설정
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({
          access_token: 'refreshed-access-token',
          expires_in: 3600,
        }),
      );

      const token = await freshService.getAccessToken();

      expect(token).toBe('refreshed-access-token');
      expect(mockFetch).toHaveBeenCalledTimes(2); // signIn + refresh
    });
  });

  describe('refreshTokenIfNeeded', () => {
    it('토큰 갱신에 성공하면 새 accessToken을 반환한다', async () => {
      // 먼저 로그인
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));
      await service.signIn(MOCK_AUTH_CODE);

      // refresh 응답 설정
      mockFetch.mockResolvedValueOnce(
        createSuccessResponse({
          access_token: 'new-access-token',
          expires_in: 7200,
        }),
      );

      const newToken = await service.refreshTokenIfNeeded();

      expect(newToken).toBe('new-access-token');

      // AsyncStorage에도 업데이트되었는지 확인
      const stored = await AsyncStorage.getItem('@cloudpocket/googleAuthTokens');
      expect(JSON.parse(stored!).accessToken).toBe('new-access-token');
    });

    it('갱신 실패 시 에러를 throw한다', async () => {
      // 먼저 로그인
      mockFetch.mockResolvedValueOnce(createSuccessResponse(MOCK_TOKEN_RESPONSE));
      await service.signIn(MOCK_AUTH_CODE);

      // refresh 실패 응답
      mockFetch.mockResolvedValueOnce(createErrorResponse());

      await expect(service.refreshTokenIfNeeded()).rejects.toThrow(
        'Failed to refresh token',
      );
    });
  });
});
