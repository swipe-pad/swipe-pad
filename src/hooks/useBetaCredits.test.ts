import { describe, it, expect } from 'bun:test'
import { FREE_SWIPES, FREE_SWIPES_CREDITS, creditsToSwipes, swipesToCredits } from './useBetaCredits'

describe('useBetaCredits constants and conversions', () => {
  it('FREE_SWIPES should be 5', () => {
    expect(FREE_SWIPES).toBe(5)
  })

  it('FREE_SWIPES_CREDITS should be 5 * 10^16 wei', () => {
    expect(FREE_SWIPES_CREDITS).toBe(5n * 10n ** 16n)
  })

  it('creditsToSwipes should convert FREE_SWIPES_CREDITS to 5', () => {
    expect(creditsToSwipes(FREE_SWIPES_CREDITS)).toBe(5)
  })

  it('swipesToCredits should convert 5 to FREE_SWIPES_CREDITS', () => {
    expect(swipesToCredits(5)).toBe(FREE_SWIPES_CREDITS)
  })
})