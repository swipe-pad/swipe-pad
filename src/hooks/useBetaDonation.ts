'use client'

import { useState, useCallback } from 'react'
import { useActiveAccount, useSendTransaction } from 'thirdweb/react'
import { getContract, prepareContractCall } from 'thirdweb'
import { client } from '@/lib/thirdweb-client'
import { celo, base } from 'thirdweb/chains'
import { betaDonationPoolAbi, BETA_POOL_ADDRESS } from '@/types/contracts'
import type { Project } from '@/lib/useConvexData'

export interface DonationItem {
  project: Project
  amount: number // In dollars (e.g., 0.01)
}

export interface UseBetaDonationResult {
  donate: (items: DonationItem[]) => Promise<string | null>
  isLoading: boolean
  error: Error | null
  txHash: string | null
}

/**
 * Hook to execute batch donations via the BetaDonationPool contract
 * No token approval needed - pool already has the tokens
 */
export function useBetaDonation(chain: 'celo' | 'base' = 'celo'): UseBetaDonationResult {
  const account = useActiveAccount()
  const { mutateAsync: sendTransaction } = useSendTransaction()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const poolAddress = BETA_POOL_ADDRESS[chain] as `0x${string}`
  const chainConfig = chain === 'celo' ? celo : base

  const isPoolDeployed = poolAddress !== '0x0000000000000000000000000000000000000000'

  const donate = useCallback(
    async (items: DonationItem[]): Promise<string | null> => {
      if (!account?.address) {
        setError(new Error('Wallet not connected'))
        return null
      }

      if (!isPoolDeployed) {
        setError(new Error('Beta donation pool not deployed'))
        return null
      }

      setIsLoading(true)
      setError(null)
      setTxHash(null)

      try {
        const contract = getContract({
          client,
          chain: chainConfig,
          address: poolAddress,
          abi: betaDonationPoolAbi,
        })

        // Convert items to contract format
        // Each project needs a recipient wallet address
        const recipients = items.map((item) => {
          const wallet = item.project.recipientWallet as string
          if (!wallet) {
            throw new Error(`Project ${item.project.name} has no wallet address`)
          }
          return wallet as `0x${string}`
        })

        // Convert dollar amounts to wei (1e18 for 18 decimals, but amounts are in dollars)
        // $0.01 = 1e16 wei (assuming 18 decimal token)
        const amounts = items.map((item) => {
          return BigInt(Math.floor(item.amount * 1e18))
        })

        // Prepare the batchDonate call
        const tx = prepareContractCall({
          contract,
          method: 'batchDonate',
          params: [recipients, amounts],
        })

        // Execute
        const result = await sendTransaction(tx)
        const hash = result.transactionHash

        setTxHash(hash)
        return hash
      } catch (err) {
        console.error('Donation failed:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [account, chainConfig, poolAddress, isPoolDeployed, sendTransaction]
  )

  return {
    donate,
    isLoading,
    error,
    txHash,
  }
}
