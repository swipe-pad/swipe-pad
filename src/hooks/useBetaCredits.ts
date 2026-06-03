'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount, useReadContract } from 'thirdweb/react'
import { getContract } from 'thirdweb'
import { client } from '@/lib/thirdweb-client'
import { celo, base } from 'thirdweb/chains'
import { betaDonationPoolAbi, BETA_POOL_ADDRESS } from '@/types/contracts'

export const FREE_SWIPES = 5
export const FREE_SWIPES_CREDITS = BigInt(FREE_SWIPES) * 10n ** 16n

export interface BetaCredits {
  remaining: bigint
  max: bigint
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get user's beta credits from the on-chain BetaDonationPool
 */
export function useBetaCredits(chain: 'celo' | 'base' = 'celo'): BetaCredits {
  const account = useActiveAccount()
  const [credits, setCredits] = useState<BetaCredits>({
    remaining: 0n,
    max: FREE_SWIPES_CREDITS, // Default max: 5 swipes
    isLoading: true,
    error: null,
    refetch: () => {},
  })

  const poolAddress = BETA_POOL_ADDRESS[chain] as `0x${string}`
  const chainConfig = chain === 'celo' ? celo : base

  // Skip if pool not deployed yet (placeholder address)
  const isPoolDeployed = poolAddress !== '0x0000000000000000000000000000000000000000'

  const contract = getContract({
    client,
    chain: chainConfig,
    address: poolAddress,
    abi: betaDonationPoolAbi,
  })

  const {
    data: userCredits,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    contract: contract!,
    method: 'getCredits',
    params: [account?.address ?? '0x0000000000000000000000000000000000000000'],
    queryOptions: { enabled: !!account?.address && isPoolDeployed },
  })

  const { data: maxCredits } = useReadContract({
    contract: contract!,
    method: 'maxCreditsPerUser',
    params: [],
    queryOptions: { enabled: isPoolDeployed },
  })

  useEffect(() => {
    if (!isPoolDeployed) {
      queueMicrotask(() => {
        setCredits({
          remaining: FREE_SWIPES_CREDITS,
          max: FREE_SWIPES_CREDITS,
          isLoading: false,
          error: null,
          refetch: () => {},
        })
      })
      return
    }

    queueMicrotask(() => {
      setCredits({
        remaining: (userCredits as bigint) ?? 0n,
        max: (maxCredits as bigint) ?? FREE_SWIPES_CREDITS,
        isLoading,
        error: error as Error | null,
        refetch,
      })
    })
  }, [userCredits, maxCredits, isLoading, error, isPoolDeployed, refetch])

  return credits
}

/**
 * Convert credits (wei) to number of swipes
 * 1 swipe = $0.01 = 1e16 wei
 */
export function creditsToSwipes(credits: bigint): number {
  return Number(credits / 10n ** 16n)
}

/**
 * Convert swipes to credits (wei)
 */
export function swipesToCredits(swipes: number): bigint {
  return BigInt(swipes) * 10n ** 16n
}
