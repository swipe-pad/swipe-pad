import { create } from "zustand"

import { createDonationSlice } from "@/store/app/slices/donationSlice"
import { createNavigationSlice } from "@/store/app/slices/navigationSlice"
import { createOnboardingSlice } from "@/store/app/slices/onboardingSlice"
import { createSessionSlice } from "@/store/app/slices/sessionSlice"
import { createUserSlice } from "@/store/app/slices/userSlice"
import type { AppStore } from "@/store/app/types"

export const useAppStore = create<AppStore>()((...args) => ({
  ...createUserSlice(...args),
  ...createDonationSlice(...args),
  ...createSessionSlice(...args),
  ...createNavigationSlice(...args),
  ...createOnboardingSlice(...args),
}))
