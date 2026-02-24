import type { AppSliceCreator } from "@/store/app/slices/utils"
import { resolveUpdater } from "@/store/app/slices/utils"
import type { AppStore } from "@/store/app/types"

type DonationSlice = Pick<
  AppStore,
  | "cart"
  | "setCart"
  | "donationAmount"
  | "setDonationAmount"
  | "donationCurrency"
  | "setDonationCurrency"
  | "confirmSwipes"
  | "setConfirmSwipes"
  | "swipeCount"
  | "setSwipeCount"
>

export const createDonationSlice: AppSliceCreator<DonationSlice> = (set) => ({
  cart: [],
  donationAmount: "0.01¢",
  donationCurrency: "cUSD",
  confirmSwipes: 20,
  swipeCount: 0,
  setCart: (next) => set((state) => ({ cart: resolveUpdater(next, state.cart) })),
  setDonationAmount: (next) =>
    set((state) => ({ donationAmount: resolveUpdater(next, state.donationAmount) })),
  setDonationCurrency: (next) =>
    set((state) => ({ donationCurrency: resolveUpdater(next, state.donationCurrency) })),
  setConfirmSwipes: (next) =>
    set((state) => ({ confirmSwipes: resolveUpdater(next, state.confirmSwipes) })),
  setSwipeCount: (next) =>
    set((state) => ({ swipeCount: resolveUpdater(next, state.swipeCount) })),
})
