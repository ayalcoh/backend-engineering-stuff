/**
 * Unit tests for Question 3: Weighted Random Selection Algorithm
 */

import {
  getWheelSpinner,
  createTestWheel,
  testSpinnerDistribution,
  calculateExpectedProbabilities,
  getAdvancedWheelSpinner,
} from '../question3';

describe('Question 3: Weighted Random Selection', () => {
  describe('getWheelSpinner', () => {
    it('should create a spinner function', () => {
      const wheel = [
        { weight: 1, reward: 'Prize A' },
        { weight: 1, reward: 'Prize B' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      expect(typeof spinner).toBe('function');
    });

    it('should return rewards from the wheel', () => {
      const wheel = [
        { weight: 1, reward: 'Prize A' },
        { weight: 1, reward: 'Prize B' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      const result = spinner();
      
      expect(['Prize A', 'Prize B']).toContain(result);
    });

    it('should respect weight distribution over many spins', () => {
      const wheel = [
        { weight: 3, reward: 'Common' },
        { weight: 1, reward: 'Rare' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      const results = testSpinnerDistribution(spinner, 10000);
      
      const commonCount = results.get('Common') || 0;
      const rareCount = results.get('Rare') || 0;
      
      // Common should be roughly 3 times more frequent than Rare
      const ratio = commonCount / rareCount;
      expect(ratio).toBeGreaterThan(2.5);
      expect(ratio).toBeLessThan(3.5);
    });

    it('should handle single wedge wheel', () => {
      const wheel = [{ weight: 1, reward: 'Only Prize' }];
      const spinner = getWheelSpinner(wheel);
      
      for (let i = 0; i < 10; i++) {
        expect(spinner()).toBe('Only Prize');
      }
    });

    it('should handle zero weight wedges mixed with positive weights', () => {
      const wheel = [
        { weight: 0, reward: 'Never' },
        { weight: 1, reward: 'Always' },
        { weight: 0, reward: 'Never 2' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      
      for (let i = 0; i < 100; i++) {
        expect(spinner()).toBe('Always');
      }
    });

    it('should validate wheel parameter', () => {
      expect(() => getWheelSpinner([])).toThrow('Wheel must be a non-empty array');
      expect(() => getWheelSpinner(null as any)).toThrow('Wheel must be a non-empty array');
      expect(() => getWheelSpinner(undefined as any)).toThrow('Wheel must be a non-empty array');
    });

    it('should validate wedge structure', () => {
      const invalidWheels = [
        [null],
        [undefined],
        ['string'],
        [{ weight: 'invalid', reward: 'test' }],
        [{ reward: 'test' }], // missing weight
      ];
      
      invalidWheels.forEach((wheel) => {
        expect(() => getWheelSpinner(wheel as any)).toThrow();
      });
    });

    it('should validate weight values', () => {
      const invalidWeights = [
        -1,      // negative
        NaN,     // not a number
        Infinity, // infinite
        -Infinity, // negative infinite
      ];
      
      invalidWeights.forEach((weight) => {
        const wheel = [{ weight, reward: 'test' }];
        expect(() => getWheelSpinner(wheel)).toThrow();
      });
    });

    it('should reject all-zero weight wheels', () => {
      const wheel = [
        { weight: 0, reward: 'Prize A' },
        { weight: 0, reward: 'Prize B' },
      ];
      
      expect(() => getWheelSpinner(wheel)).toThrow('All wedges have zero weight - cannot select randomly');
    });

    it('should handle fractional weights', () => {
      const wheel = [
        { weight: 0.1, reward: 'Rare' },
        { weight: 0.9, reward: 'Common' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      const results = testSpinnerDistribution(spinner, 10000);
      
      const rareCount = results.get('Rare') || 0;
      const commonCount = results.get('Common') || 0;
      
      // Common should be roughly 9 times more frequent than Rare
      const ratio = commonCount / rareCount;
      expect(ratio).toBeGreaterThan(7);
      expect(ratio).toBeLessThan(11);
    });

    it('should handle large weight differences', () => {
      const wheel = [
        { weight: 1, reward: 'Ultra Rare' },
        { weight: 1000, reward: 'Common' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      const results = testSpinnerDistribution(spinner, 10000);
      
      const ultraRareCount = results.get('Ultra Rare') || 0;
      const commonCount = results.get('Common') || 0;
      
      // Ultra Rare should be very infrequent
      expect(ultraRareCount).toBeLessThan(commonCount / 100);
    });
  });

  describe('Utility Functions', () => {
    it('should create test wheel correctly', () => {
      const wheel = createTestWheel();
      
      expect(wheel).toHaveLength(4);
      expect(wheel[0].weight).toBe(1);
      expect(wheel[1].weight).toBe(0.5);
      expect(wheel[2].weight).toBe(0.1);
      expect(wheel[3].weight).toBe(0.01);
    });

    it('should calculate expected probabilities correctly', () => {
      const wheel = [
        { weight: 2, reward: 'A' },
        { weight: 3, reward: 'B' },
        { weight: 5, reward: 'C' },
      ];
      
      const probabilities = calculateExpectedProbabilities(wheel);
      
      expect(probabilities.get('A')).toBeCloseTo(0.2); // 2/10
      expect(probabilities.get('B')).toBeCloseTo(0.3); // 3/10
      expect(probabilities.get('C')).toBeCloseTo(0.5); // 5/10
    });

    it('should test spinner distribution with custom iterations', () => {
      const wheel = [{ weight: 1, reward: 'Test' }];
      const spinner = getWheelSpinner(wheel);
      
      const results = testSpinnerDistribution(spinner, 100);
      expect(results.get('Test')).toBe(100);
    });

    it('should validate distribution test parameters', () => {
      const wheel = [{ weight: 1, reward: 'Test' }];
      const spinner = getWheelSpinner(wheel);
      
      expect(() => testSpinnerDistribution(spinner, 0)).toThrow('Iterations must be positive');
      expect(() => testSpinnerDistribution(spinner, -1)).toThrow('Iterations must be positive');
    });
  });

  describe('getAdvancedWheelSpinner', () => {
    it('should filter out zero-weight wedges', () => {
      const wheel = [
        { weight: 0, reward: 'Never' },
        { weight: 1, reward: 'Sometimes' },
        { weight: 0, reward: 'Never 2' },
        { weight: 2, reward: 'Often' },
      ];
      
      const spinner = getAdvancedWheelSpinner(wheel);
      const results = new Set();
      
      for (let i = 0; i < 100; i++) {
        results.add(spinner());
      }
      
      expect(results.has('Never')).toBe(false);
      expect(results.has('Never 2')).toBe(false);
      expect(results.has('Sometimes')).toBe(true);
      expect(results.has('Often')).toBe(true);
    });

    it('should throw error when all wedges have zero weight', () => {
      const wheel = [
        { weight: 0, reward: 'Never' },
        { weight: 0, reward: 'Never 2' },
      ];
      
      expect(() => getAdvancedWheelSpinner(wheel)).toThrow('No wedges with positive weight available');
    });
  });

  describe('Distribution Accuracy', () => {
    it('should maintain accurate distribution with test wheel', () => {
      const wheel = createTestWheel();
      const spinner = getWheelSpinner(wheel);
      const results = testSpinnerDistribution(spinner, 20000);
      const expectedProbs = calculateExpectedProbabilities(wheel);
      
      const totalSpins = 20000;
      
      for (const [reward, expectedProb] of expectedProbs) {
        const actualCount = results.get(reward) || 0;
        const actualProb = actualCount / totalSpins;
        const tolerance = expectedProb * 0.2; // 20% tolerance
        
        expect(Math.abs(actualProb - expectedProb)).toBeLessThan(tolerance);
      }
    });

    it('should handle edge case of very small weights', () => {
      const wheel = [
        { weight: 0.001, reward: 'Ultra Rare' },
        { weight: 0.999, reward: 'Common' },
      ];
      
      const spinner = getWheelSpinner(wheel);
      const results = testSpinnerDistribution(spinner, 100000);
      
      const ultraRareCount = results.get('Ultra Rare') || 0;
      const commonCount = results.get('Common') || 0;
      
      // Should still get some ultra rare results
      expect(ultraRareCount).toBeGreaterThan(0);
      expect(commonCount).toBeGreaterThan(ultraRareCount * 100);
    });
  });
});