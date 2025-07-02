/**
 * Question 1: Thread-Safe Caching Solution
 * 
 * PROBLEM: Race condition where multiple concurrent calls can trigger duplicate database reads
 * SOLUTION: Cache promises for in-flight requests to prevent duplicate DB calls
 */

type RoomConfig = unknown;
declare function readConfigFromDb(roomId: number): Promise<RoomConfig>;

const cachedConfigMap = new Map<number, RoomConfig>();
const pendingPromises = new Map<number, Promise<RoomConfig>>();

/**
 * Fetches room configuration with thread-safe caching to prevent race conditions.
 * 
 * Uses a dual-map pattern: one for cached results, another for pending promises.
 * This prevents multiple concurrent calls from triggering duplicate database reads.
 * 
 * @param roomId - The unique identifier for the room (must be positive integer)
 * @returns Promise resolving to the room configuration
 * @throws Error if roomId is invalid (not a positive integer)
 * 
 * @example
 * ```typescript
 * const config = await fetchRoomConfig(123);
 * // Subsequent calls with same ID return cached result
 * const sameConfig = await fetchRoomConfig(123); // No DB call
 * ```
 */
export async function fetchRoomConfig(roomId: number): Promise<RoomConfig> {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new Error('Invalid roomId: must be a positive integer');
  }

  // Return cached config if available
  const cachedConfig = cachedConfigMap.get(roomId);
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  // Return pending promise if request is already in flight
  const pendingPromise = pendingPromises.get(roomId);
  if (pendingPromise) {
    return pendingPromise;
  }

  // Create new promise and cache it to prevent duplicate requests
  const configPromise = readConfigFromDb(roomId)
    .then((config) => {
      cachedConfigMap.set(roomId, config);
      pendingPromises.delete(roomId);
      return config;
    })
    .catch((error) => {
      pendingPromises.delete(roomId);
      throw error;
    });

  pendingPromises.set(roomId, configPromise);
  return configPromise;
}

/**
 * Clears all cached configurations and pending promises.
 * 
 * Useful for testing or when you need to force fresh data retrieval.
 * 
 * @example
 * ```typescript
 * clearCache();
 * // Next fetchRoomConfig call will hit database
 * ```
 */
export function clearCache(): void {
  cachedConfigMap.clear();
  pendingPromises.clear();
}

/**
 * Returns current cache statistics for monitoring and debugging.
 * 
 * @returns Object containing cache metrics
 * @returns cachedConfigs - Number of configurations currently cached
 * @returns pendingRequests - Number of database requests currently in flight
 * 
 * @example
 * ```typescript
 * const stats = getCacheStats();
 * console.log(`Cached: ${stats.cachedConfigs}, Pending: ${stats.pendingRequests}`);
 * ```
 */
export function getCacheStats(): { cachedConfigs: number; pendingRequests: number } {
  return {
    cachedConfigs: cachedConfigMap.size,
    pendingRequests: pendingPromises.size,
  };
}