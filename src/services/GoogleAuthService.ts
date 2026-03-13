import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { GoogleAuthTokens } from '../types/googleSheets';
import { GOOGLE_CONFIG } from '../constants/googleSheets';

export class GoogleAuthService {
  private tokens: GoogleAuthTokens | null = null;

  async hydrate(): Promise<void> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_AUTH_TOKENS);
    if (stored) {
      this.tokens = JSON.parse(stored);
    }
  }

  async signIn(authCode: string): Promise<GoogleAuthTokens> {
    // Exchange auth code for tokens
    const response = await fetch(GOOGLE_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'cloudpocket://',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to sign in with Google');
    }

    const data = await response.json();
    const tokens: GoogleAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    this.tokens = tokens;
    await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_AUTH_TOKENS, JSON.stringify(tokens));
    return tokens;
  }

  async signOut(): Promise<void> {
    this.tokens = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_AUTH_TOKENS);
  }

  isSignedIn(): boolean {
    return this.tokens !== null;
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;

    if (this.tokens.expiresAt < Date.now()) {
      try {
        const newToken = await this.refreshTokenIfNeeded();
        return newToken;
      } catch {
        return null;
      }
    }

    return this.tokens.accessToken;
  }

  async refreshTokenIfNeeded(): Promise<string> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(GOOGLE_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: this.tokens.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.tokens = {
      ...this.tokens,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_AUTH_TOKENS, JSON.stringify(this.tokens));
    return this.tokens.accessToken;
  }
}
