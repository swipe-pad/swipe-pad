// Pluggable Randomness Oracle Architecture
// 
// This module defines the interface for randomness backends.
// Implementations can be swapped at runtime or compile time.
// 
// Backends:
// - PseudoRandom: Deterministic pseudo-random (default, for testing)
// - ChainlinkVRF: Chainlink Verifiable Random Function (production)
// - API3QRNG: API3 Quantum Random Number Generator (alternative)
// - PythEntropy: Pyth Network entropy (alternative)
//
// Usage:
//   const oracle = createRandomnessOracle("pseudo")
//   const randomValue = await oracle.getRandomNumber(seed)

export type RandomnessBackend = "pseudo" | "chainlink" | "api3" | "pyth"

export interface RandomnessOracle {
  readonly name: string
  readonly backend: RandomnessBackend
  getRandomNumber(seed: string): Promise<number>
  getRandomNumbers(seed: string, count: number): Promise<number[]>
  isAvailable(): boolean
}

export class PseudoRandomOracle implements RandomnessOracle {
  readonly name = "PseudoRandom"
  readonly backend = "pseudo" as const

  private seededRandom(seed: string): () => number {
    // Simple xorshift-like PRNG for deterministic testing
    let state = 0
    for (let i = 0; i < seed.length; i++) {
      state = ((state << 5) - state + seed.charCodeAt(i)) | 0
    }
    state = state >>> 0
    
    return () => {
      state ^= state << 13
      state ^= state >>> 17
      state ^= state << 5
      state = state >>> 0
      return (state / 4294967296)
    }
  }

  async getRandomNumber(seed: string): Promise<number> {
    const rng = this.seededRandom(seed)
    return rng()
  }

  async getRandomNumbers(seed: string, count: number): Promise<number[]> {
    const rng = this.seededRandom(seed)
    return Array.from({ length: count }, () => rng())
  }

  isAvailable(): boolean {
    return true
  }
}

// Placeholder implementations for future backends
export class ChainlinkVRFOracle implements RandomnessOracle {
  readonly name = "ChainlinkVRF"
  readonly backend = "chainlink" as const

  async getRandomNumber(_seed: string): Promise<number> {
    throw new Error("Chainlink VRF not yet implemented")
  }

  async getRandomNumbers(_seed: string, _count: number): Promise<number[]> {
    throw new Error("Chainlink VRF not yet implemented")
  }

  isAvailable(): boolean {
    return false
  }
}

export class API3QRNGOracle implements RandomnessOracle {
  readonly name = "API3QRNG"
  readonly backend = "api3" as const

  async getRandomNumber(_seed: string): Promise<number> {
    throw new Error("API3 QRNG not yet implemented")
  }

  async getRandomNumbers(_seed: string, _count: number): Promise<number[]> {
    throw new Error("API3 QRNG not yet implemented")
  }

  isAvailable(): boolean {
    return false
  }
}

export class PythEntropyOracle implements RandomnessOracle {
  readonly name = "PythEntropy"
  readonly backend = "pyth" as const

  async getRandomNumber(_seed: string): Promise<number> {
    throw new Error("Pyth Entropy not yet implemented")
  }

  async getRandomNumbers(_seed: string, _count: number): Promise<number[]> {
    throw new Error("Pyth Entropy not yet implemented")
  }

  isAvailable(): boolean {
    return false
  }
}

const ORACLE_REGISTRY: Record<RandomnessBackend, new () => RandomnessOracle> = {
  pseudo: PseudoRandomOracle,
  chainlink: ChainlinkVRFOracle,
  api3: API3QRNGOracle,
  pyth: PythEntropyOracle,
}

export function createRandomnessOracle(backend: RandomnessBackend = "pseudo"): RandomnessOracle {
  const OracleClass = ORACLE_REGISTRY[backend]
  if (!OracleClass) {
    throw new Error(`Unknown randomness backend: ${backend}`)
  }
  return new OracleClass()
}

export function listAvailableOracles(): RandomnessOracle[] {
  return (Object.keys(ORACLE_REGISTRY) as RandomnessBackend[])
    .map((backend) => createRandomnessOracle(backend))
    .filter((oracle) => oracle.isAvailable())
}
