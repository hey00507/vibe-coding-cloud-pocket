import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from './interfaces/IStorageService';

export class StorageService implements IStorageService {
  async save<T>(key: string, data: T[]): Promise<void> {
    try {
      const json = JSON.stringify(data);
      await AsyncStorage.setItem(key, json);
    } catch (error) {
      console.error(`[StorageService] save(${key}) failed:`, error);
    }
  }

  async load<T>(key: string, dateFields?: string[]): Promise<T[]> {
    try {
      const json = await AsyncStorage.getItem(key);
      if (json === null) return [];
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return [];
      if (dateFields && dateFields.length > 0) {
        return parsed.map((item: Record<string, unknown>) =>
          this.reviveDates(item, dateFields)
        ) as T[];
      }
      return parsed as T[];
    } catch (error) {
      console.error(`[StorageService] load(${key}) failed:`, error);
      return [];
    }
  }

  async saveValue<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await AsyncStorage.setItem(key, json);
    } catch (error) {
      console.error(`[StorageService] saveValue(${key}) failed:`, error);
    }
  }

  async loadValue<T>(key: string): Promise<T | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      if (json === null) return null;
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`[StorageService] loadValue(${key}) failed:`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] remove(${key}) failed:`, error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error(`[StorageService] clearAll() failed:`, error);
    }
  }

  private reviveDates<T>(
    item: Record<string, unknown>,
    dateFields: string[]
  ): T {
    const result = { ...item };
    for (const field of dateFields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = new Date(result[field] as string);
      }
    }
    return result as T;
  }
}
