import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FreeCoffeeReason } from '#/api/photos/use-api-photos-upload-mutation'

export const THANKS_TTL_MS = 30 * 60 * 1000 // 30m

type ThanksState = {
  placeId: string | null
  uploadId: string | null
  coffeeReason: FreeCoffeeReason | null
  savedAt: number | null
  saveUpload: (placeId: string, uploadId: string) => void
  setCoffeeReason: (reason: FreeCoffeeReason | null) => void
  clear: () => void
}

const initial = {
  placeId: null,
  uploadId: null,
  coffeeReason: null,
  savedAt: null,
}

export const useThanksStore = create<ThanksState>()(
  persist(
    (set) => ({
      ...initial,
      saveUpload: (placeId, uploadId) =>
        set({ placeId, uploadId, coffeeReason: null, savedAt: Date.now() }),
      setCoffeeReason: (coffeeReason) =>
        set((s) => ({ coffeeReason, savedAt: Date.now() })),
      clear: () => set(initial),
    }),
    {
      name: 'thanks-state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
