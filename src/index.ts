/**
 * Entry point demonstrating all implemented solutions
 */

// Question 1: Thread-Safe Caching
export { fetchRoomConfig, getCacheStats, clearCache } from './question1';

// Question 2: Stream Processing
export { 
  readAchievementsPage,
  readAchievementsPageGenerator,
  createAchievementsStream, 
  processAchievementsWithCallback, 
  processAchievementsWithGenerator 
} from './question2';

// Question 3: Weighted Random Selection
export { 
  getWheelSpinner, 
  createTestWheel, 
  testSpinnerDistribution,
  calculateExpectedProbabilities,
  getAdvancedWheelSpinner
} from './question3';