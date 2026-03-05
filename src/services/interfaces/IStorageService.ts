export interface IStorageService {
  save<T>(key: string, data: T[]): Promise<void>;
  load<T>(key: string, dateFields?: string[]): Promise<T[]>;
  saveValue<T>(key: string, value: T): Promise<void>;
  loadValue<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clearAll(): Promise<void>;
}
