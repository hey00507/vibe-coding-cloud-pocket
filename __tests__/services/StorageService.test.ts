import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../src/services/StorageService';
import { IStorageService } from '../../src/services/interfaces/IStorageService';

describe('StorageService', () => {
  let service: IStorageService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    service = new StorageService();
  });

  describe('save / load', () => {
    it('should save and load an array of items', async () => {
      const items = [
        { id: '1', name: 'Item1' },
        { id: '2', name: 'Item2' },
      ];

      await service.save('test-key', items);
      const loaded = await service.load<{ id: string; name: string }>('test-key');

      expect(loaded).toEqual(items);
    });

    it('should return empty array when key does not exist', async () => {
      const loaded = await service.load('nonexistent-key');
      expect(loaded).toEqual([]);
    });

    it('should return empty array when stored value is not an array', async () => {
      await AsyncStorage.setItem('bad-key', JSON.stringify({ notArray: true }));
      const loaded = await service.load('bad-key');
      expect(loaded).toEqual([]);
    });

    it('should revive date fields when dateFields is provided', async () => {
      const dateStr = '2026-03-05T09:00:00.000Z';
      const items = [{ id: '1', date: dateStr, name: 'Test' }];

      await AsyncStorage.setItem('date-key', JSON.stringify(items));
      const loaded = await service.load<{ id: string; date: Date; name: string }>(
        'date-key',
        ['date']
      );

      expect(loaded[0].date).toBeInstanceOf(Date);
      expect(loaded[0].date.toISOString()).toBe(dateStr);
      expect(loaded[0].name).toBe('Test');
    });

    it('should handle multiple date fields', async () => {
      const items = [
        {
          id: '1',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        },
      ];

      await AsyncStorage.setItem('multi-date', JSON.stringify(items));
      const loaded = await service.load<{
        id: string;
        startDate: Date;
        endDate: Date;
      }>('multi-date', ['startDate', 'endDate']);

      expect(loaded[0].startDate).toBeInstanceOf(Date);
      expect(loaded[0].endDate).toBeInstanceOf(Date);
    });

    it('should not convert null/undefined date fields', async () => {
      const items = [{ id: '1', startDate: null, endDate: undefined }];

      await AsyncStorage.setItem('null-date', JSON.stringify(items));
      const loaded = await service.load<{
        id: string;
        startDate: Date | null;
        endDate: Date | undefined;
      }>('null-date', ['startDate', 'endDate']);

      expect(loaded[0].startDate).toBeNull();
    });

    it('should load without date conversion when dateFields is empty', async () => {
      const items = [{ id: '1', date: '2026-03-05T00:00:00.000Z' }];

      await AsyncStorage.setItem('no-revive', JSON.stringify(items));
      const loaded = await service.load<{ id: string; date: string }>(
        'no-revive',
        []
      );

      expect(typeof loaded[0].date).toBe('string');
    });

    it('should handle save error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Write error'));

      await service.save('fail-key', [{ id: '1' }]);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] save(fail-key) failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle load error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Read error'));

      const result = await service.load('fail-key');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] load(fail-key) failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('saveValue / loadValue', () => {
    it('should save and load a single value', async () => {
      await service.saveValue('counter', 42);
      const loaded = await service.loadValue<number>('counter');
      expect(loaded).toBe(42);
    });

    it('should save and load a boolean value', async () => {
      await service.saveValue('flag', true);
      const loaded = await service.loadValue<boolean>('flag');
      expect(loaded).toBe(true);
    });

    it('should return null when key does not exist', async () => {
      const loaded = await service.loadValue('nonexistent');
      expect(loaded).toBeNull();
    });

    it('should handle saveValue error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('err'));

      await service.saveValue('fail', 'val');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] saveValue(fail) failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should handle loadValue error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('err'));

      const result = await service.loadValue('fail');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] loadValue(fail) failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      await service.saveValue('to-remove', 'value');
      await service.remove('to-remove');
      const loaded = await service.loadValue('to-remove');
      expect(loaded).toBeNull();
    });

    it('should handle remove error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('err'));

      await service.remove('fail');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] remove(fail) failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', async () => {
      await service.saveValue('key1', 'val1');
      await service.saveValue('key2', 'val2');
      await service.clearAll();

      const val1 = await service.loadValue('key1');
      const val2 = await service.loadValue('key2');
      expect(val1).toBeNull();
      expect(val2).toBeNull();
    });

    it('should handle clearAll error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(AsyncStorage, 'clear').mockRejectedValueOnce(new Error('err'));

      await service.clearAll();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[StorageService] clearAll() failed:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
