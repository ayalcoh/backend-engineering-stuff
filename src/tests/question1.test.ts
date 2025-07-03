/**
 * Unit tests for Question 1: Thread-Safe Caching Solution
 */

import { fetchRoomConfig, clearCache, getCacheStats } from '../question1';

// Create a mock for the readConfigFromDb function
const mockReadConfigFromDb = jest.fn();

// Mock the readConfigFromDb function globally
(global as unknown as { readConfigFromDb: typeof mockReadConfigFromDb }).readConfigFromDb = mockReadConfigFromDb;

describe('Question 1: Thread-Safe Caching', () => {
  beforeEach(() => {
    clearCache();
    mockReadConfigFromDb.mockClear();
  });

  describe('fetchRoomConfig', () => {
    it('should fetch config from database on first call', async () => {
      const mockConfig = { level: 1, enemies: 5 };
      mockReadConfigFromDb.mockResolvedValue(mockConfig);

      const result = await fetchRoomConfig(1);

      expect(result).toBe(mockConfig);
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(1);
      expect(mockReadConfigFromDb).toHaveBeenCalledWith(1);
    });

    it('should return cached config on subsequent calls', async () => {
      const mockConfig = { level: 1, enemies: 5 };
      mockReadConfigFromDb.mockResolvedValue(mockConfig);

      const result1 = await fetchRoomConfig(1);
      const result2 = await fetchRoomConfig(1);

      expect(result1).toBe(mockConfig);
      expect(result2).toBe(mockConfig);
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent requests without duplicate DB calls', async () => {
      const mockConfig = { level: 1, enemies: 5 };
      mockReadConfigFromDb.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockConfig), 100))
      );

      // Start multiple concurrent requests
      const promises = [
        fetchRoomConfig(1),
        fetchRoomConfig(1),
        fetchRoomConfig(1),
      ];

      const results = await Promise.all(promises);

      // All should return the same config
      results.forEach((result: unknown) => expect(result).toBe(mockConfig));
      
      // DB should only be called once despite concurrent requests
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(1);
    });

    it('should handle different roomIds independently', async () => {
      const mockConfig1 = { level: 1, enemies: 5 };
      const mockConfig2 = { level: 2, enemies: 10 };
      
      mockReadConfigFromDb
        .mockResolvedValueOnce(mockConfig1)
        .mockResolvedValueOnce(mockConfig2);

      const result1 = await fetchRoomConfig(1);
      const result2 = await fetchRoomConfig(2);

      expect(result1).toBe(mockConfig1);
      expect(result2).toBe(mockConfig2);
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors properly', async () => {
      const error = new Error('Database connection failed');
      mockReadConfigFromDb.mockRejectedValue(error);

      await expect(fetchRoomConfig(1)).rejects.toThrow('Database connection failed');
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(1);
    });

    it('should allow retry after database error', async () => {
      const error = new Error('Database connection failed');
      const mockConfig = { level: 1, enemies: 5 };
      
      mockReadConfigFromDb
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockConfig);

      // First call should fail
      await expect(fetchRoomConfig(1)).rejects.toThrow('Database connection failed');
      
      // Second call should succeed
      const result = await fetchRoomConfig(1);
      expect(result).toBe(mockConfig);
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(2);
    });

    it('should validate input parameters', async () => {
      const invalidInputs = [0, -1, 1.5, NaN, Infinity, -Infinity];
      
      for (const invalid of invalidInputs) {
        await expect(fetchRoomConfig(invalid)).rejects.toThrow('Invalid roomId: must be a positive integer');
      }
    });

    it('should handle concurrent requests with errors', async () => {
      const error = new Error('Database error');
      mockReadConfigFromDb.mockRejectedValue(error);

      const promises = [
        fetchRoomConfig(1),
        fetchRoomConfig(1),
        fetchRoomConfig(1),
      ];

      await expect(Promise.all(promises)).rejects.toThrow('Database error');
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache properly', async () => {
      const mockConfig = { level: 1, enemies: 5 };
      mockReadConfigFromDb.mockResolvedValue(mockConfig);

      await fetchRoomConfig(1);
      expect(getCacheStats().cachedConfigs).toBe(1);

      clearCache();
      expect(getCacheStats().cachedConfigs).toBe(0);

      // Should fetch from DB again after cache clear
      await fetchRoomConfig(1);
      expect(mockReadConfigFromDb).toHaveBeenCalledTimes(2);
    });

    it('should provide accurate cache statistics', async () => {
      const mockConfig = { level: 1, enemies: 5 };
      mockReadConfigFromDb.mockResolvedValue(mockConfig);

      expect(getCacheStats()).toEqual({ cachedConfigs: 0, pendingRequests: 0 });

      const promise = fetchRoomConfig(1);
      expect(getCacheStats().pendingRequests).toBe(1);

      await promise;
      expect(getCacheStats()).toEqual({ cachedConfigs: 1, pendingRequests: 0 });
    });
  });
});