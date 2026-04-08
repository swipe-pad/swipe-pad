export const TOP_UP_DIALOG_EVENT = "swipepad:open-top-up-dialog"

export type TopUpDialogDetail = {
  reason?: string
  defaultPlanId?: string
}

export function openTopUpDialog(reason?: string, defaultPlanId?: string) {
  if (typeof window === "undefined") return

  window.dispatchEvent(
    new CustomEvent<TopUpDialogDetail>(TOP_UP_DIALOG_EVENT, {
      detail: { reason, defaultPlanId },
    })
  )
}
