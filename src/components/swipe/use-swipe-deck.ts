import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { mapDecisionToFundingIntent, type FundingIntent, type SwipeDecision, type SwipeDir } from "@/components/swipe/engine"

export type SwipeItem<T> = {
  id: string
  data: T
  absoluteIndex: number
  animateInFrom?: SwipeDir
}

export type SwipeHistoryEntry<T> = {
  item: SwipeItem<T>
  decision: SwipeDecision
  intent: FundingIntent
  ts: number
}

export type DeckConfig = {
  visible: number
}

type RefillFn<T> = (need: number) => Promise<SwipeItem<T>[]> | SwipeItem<T>[]

type SwipeDeckState<T> = {
  items: SwipeItem<T>[]
  history: SwipeHistoryEntry<T>[]
}

export function useSwipeDeck<T>(options: {
  config: DeckConfig
  initial: SwipeItem<T>[]
  refill?: RefillFn<T>
  onCommitIntent?: (intent: FundingIntent, item: SwipeItem<T>, decision: SwipeDecision) => void
}) {
  const { config, initial, refill, onCommitIntent } = options

  const busyRef = useRef(false)
  const fetchingRef = useRef(false)
  const [state, setState] = useState<SwipeDeckState<T>>({
    items: initial,
    history: [],
  })

  useEffect(() => {
    const need = config.visible + 2 - state.items.length
    if (need <= 0 || fetchingRef.current || !refill) return

    fetchingRef.current = true
    void Promise.resolve(refill(need))
      .then((newItems) => {
        if (!newItems || newItems.length === 0) return
        setState((prev) => ({
          ...prev,
          items: [...prev.items, ...newItems],
        }))
      })
      .finally(() => {
        fetchingRef.current = false
      })
  }, [config.visible, refill, state.items.length])

  const commit = useCallback((decision: SwipeDecision) => {
    setState((prev) => {
      const top = prev.items[0]
      if (!top) return prev

      const intent = mapDecisionToFundingIntent(decision)
      const entry: SwipeHistoryEntry<T> = {
        item: top,
        decision,
        intent,
        ts: Date.now(),
      }

      setTimeout(() => {
        onCommitIntent?.(intent, top, decision)
      }, 0)

      return {
        items: prev.items.slice(1).map((item) => (item.animateInFrom ? { ...item, animateInFrom: undefined } : item)),
        history: [...prev.history, entry],
      }
    })
  }, [onCommitIntent])

  const undo = useCallback(() => {
    if (busyRef.current) return

    setState((prev) => {
      if (prev.history.length === 0) return prev

      const last = prev.history[prev.history.length - 1]
      if (prev.items.some((item) => item.id === last.item.id)) {
        return prev
      }

      return {
        items: [
          { ...last.item, animateInFrom: last.decision.dir },
          ...prev.items.map((item) => (item.animateInFrom ? { ...item, animateInFrom: undefined } : item)),
        ],
        history: prev.history.slice(0, -1),
      }
    })
  }, [])

  const resetDeck = useCallback((newItems: SwipeItem<T>[]) => {
    setState({ items: newItems, history: [] })
    busyRef.current = false
  }, [])

  const visibleItems = useMemo(() => state.items.slice(0, config.visible), [config.visible, state.items])

  return {
    busyRef,
    items: state.items,
    visibleItems,
    history: state.history,
    commit,
    undo,
    resetDeck,
  }
}
