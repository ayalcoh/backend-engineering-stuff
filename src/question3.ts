/**
 * Question 3: Weighted Random Selection Algorithm
 * 
 * Implements weighted "Spin the Wheel" using cumulative distribution function
 * Weights are relative (weight 2 = 2x likely than weight 1), can be 0 but not negative
 */

type Reward = unknown;
type Wedge = { weight: number; reward: Reward };
type Wheel = Wedge[];

/**
 * Creates a weighted random spinner function using cumulative distribution.
 * 
 * Implements fair weighted random selection where higher weights have proportionally
 * higher selection probability. Uses pre-computed cumulative weights for O(n) 
 * selection performance. Only uses Math.random() as specified.
 * 
 * @param wheel - Array of wedges, each with weight and reward properties
 * @returns Function that returns random rewards based on weights
 * @throws Error if wheel is invalid or all weights are zero
 * 
 * @example
 * ```typescript
 * const wheel = [
 *   { weight: 3, reward: 'Common' },
 *   { weight: 1, reward: 'Rare' }
 * ];
 * const spinner = getWheelSpinner(wheel);
 * const result = spinner(); // 75% chance 'Common', 25% chance 'Rare'
 * ```
 */
export function getWheelSpinner(wheel: Wheel): () => Reward {
  if (!Array.isArray(wheel) || wheel.length === 0) {
    throw new Error('Wheel must be a non-empty array');
  }

  let totalWeight = 0;
  const cumulativeWeights: number[] = [];

  for (let i = 0; i < wheel.length; i++) {
    const wedge = wheel[i];
    
    if (!wedge || typeof wedge !== 'object') {
      throw new Error(`Invalid wedge at index ${i}: must be an object`);
    }
    
    if (typeof wedge.weight !== 'number') {
      throw new Error(`Invalid weight at index ${i}: must be a number`);
    }
    
    if (wedge.weight < 0) {
      throw new Error(`Invalid weight at index ${i}: cannot be negative`);
    }
    
    if (!Number.isFinite(wedge.weight)) {
      throw new Error(`Invalid weight at index ${i}: must be finite`);
    }

    totalWeight += wedge.weight;
    cumulativeWeights.push(totalWeight);
  }

  if (totalWeight === 0) {
    throw new Error('All wedges have zero weight - cannot select randomly');
  }

  return (): Reward => {
    const randomValue = Math.random() * totalWeight;
    
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (randomValue < cumulativeWeights[i]) {
        return wheel[i].reward;
      }
    }
    
    return wheel[wheel.length - 1].reward;
  };
}

/**
 * Creates a sample wheel with varying probability weights for testing.
 * 
 * @returns Wheel with 4 rewards: Common (61.7%), Uncommon (30.9%), Rare (6.2%), Legendary (0.6%)
 * 
 * @example
 * ```typescript
 * const wheel = createTestWheel();
 * const spinner = getWheelSpinner(wheel);
 * ```
 */
export function createTestWheel(): Wheel {
  return [
    { weight: 1, reward: 'Common Prize' },
    { weight: 0.5, reward: 'Uncommon Prize' },
    { weight: 0.1, reward: 'Rare Prize' },
    { weight: 0.01, reward: 'Legendary Prize' },
  ];
}

/**
 * Tests spinner distribution by running multiple iterations and counting results.
 * 
 * Useful for validating that weighted random selection produces expected probability
 * distributions over large sample sizes.
 * 
 * @param spinner - The spinner function to test
 * @param iterations - Number of spins to perform (default: 10000)
 * @returns Map of rewards to their occurrence counts
 * @throws Error if iterations is not positive
 * 
 * @example
 * ```typescript
 * const spinner = getWheelSpinner(wheel);
 * const results = testSpinnerDistribution(spinner, 20000);
 * console.log(`Common appeared ${results.get('Common')} times`);
 * ```
 */
export function testSpinnerDistribution(
  spinner: () => Reward,
  iterations: number = 10000
): Map<Reward, number> {
  if (iterations <= 0) {
    throw new Error('Iterations must be positive');
  }

  const results = new Map<Reward, number>();
  
  for (let i = 0; i < iterations; i++) {
    const result = spinner();
    results.set(result, (results.get(result) || 0) + 1);
  }
  
  return results;
}

/**
 * Calculates theoretical probability for each reward based on weights.
 * 
 * @param wheel - Wheel configuration to analyze
 * @returns Map of rewards to their expected probability (0-1)
 * 
 * @example
 * ```typescript
 * const wheel = createTestWheel();
 * const probs = calculateExpectedProbabilities(wheel);
 * console.log(`Common has ${(probs.get('Common') * 100).toFixed(1)}% chance`);
 * ```
 */
export function calculateExpectedProbabilities(wheel: Wheel): Map<Reward, number> {
  const totalWeight = wheel.reduce((sum, wedge) => sum + wedge.weight, 0);
  const probabilities = new Map<Reward, number>();
  
  for (const wedge of wheel) {
    probabilities.set(wedge.reward, wedge.weight / totalWeight);
  }
  
  return probabilities;
}

/**
 * Creates spinner that automatically filters out zero-weight wedges.
 * 
 * Convenience function that removes inactive wedges before creating the spinner,
 * useful when wheel might contain disabled/inactive rewards.
 * 
 * @param wheel - Wheel that may contain zero-weight wedges
 * @returns Spinner function using only positive-weight wedges
 * @throws Error if no wedges have positive weight
 * 
 * @example
 * ```typescript
 * const wheel = [
 *   { weight: 0, reward: 'Disabled' },
 *   { weight: 1, reward: 'Active' }
 * ];
 * const spinner = getAdvancedWheelSpinner(wheel); // Only 'Active' can be selected
 * ```
 */
export function getAdvancedWheelSpinner(wheel: Wheel): () => Reward {
  const activeWedges = wheel.filter(wedge => wedge.weight > 0);
  
  if (activeWedges.length === 0) {
    throw new Error('No wedges with positive weight available');
  }
  
  return getWheelSpinner(activeWedges);
}