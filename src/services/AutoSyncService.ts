import { AppState, AppStateStatus } from 'react-native';
import { IAutoSyncService } from './interfaces/IAutoSyncService';

interface AutoSyncDeps {
  authService: {
    isSignedIn(): boolean;
    hydrate(): Promise<void>;
  };
  sheetsService: {
    initialize(): Promise<void>;
    getSpreadsheetId(): string | null;
    getLastSyncTime(): Date | null;
    exportAll(): Promise<{ status: string; message: string }>;
  };
  minIntervalMs?: number;
}

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6시간

export class AutoSyncService implements IAutoSyncService {
  private deps: AutoSyncDeps;
  private minIntervalMs: number;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private lastResult: { success: boolean; timestamp: Date | null; error?: string } = {
    success: false,
    timestamp: null,
  };
  private syncing = false;

  constructor(deps: AutoSyncDeps) {
    this.deps = deps;
    this.minIntervalMs = deps.minIntervalMs ?? DEFAULT_INTERVAL_MS;
  }

  shouldSync(): boolean {
    if (!this.deps.authService.isSignedIn()) return false;
    if (!this.deps.sheetsService.getSpreadsheetId()) return false;

    const lastSync = this.deps.sheetsService.getLastSyncTime();
    if (!lastSync) return true;

    const elapsed = Date.now() - lastSync.getTime();
    return elapsed >= this.minIntervalMs;
  }

  async syncIfNeeded(): Promise<boolean> {
    if (!this.shouldSync() || this.syncing) return false;

    this.syncing = true;
    try {
      await this.deps.sheetsService.exportAll();
      this.lastResult = { success: true, timestamp: new Date() };
      return true;
    } catch (error) {
      this.lastResult = {
        success: false,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      return false;
    } finally {
      this.syncing = false;
    }
  }

  async initializeAndSync(): Promise<void> {
    await this.deps.authService.hydrate();
    await this.deps.sheetsService.initialize();
    await this.syncIfNeeded();
  }

  startListening(): void {
    if (this.appStateSubscription) return;

    let previousState: AppStateStatus = AppState.currentState;

    this.appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (previousState.match(/inactive|background/) && nextState === 'active') {
        this.syncIfNeeded();
      }
      previousState = nextState;
    });
  }

  stopListening(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  getLastAutoSyncResult(): { success: boolean; timestamp: Date | null; error?: string } {
    return { ...this.lastResult };
  }
}
