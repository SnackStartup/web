import { create } from 'zustand'

export type LeaveIntent = 'navigate' | 'signOut'

export type UnsavedDraft = {
  isDirty: boolean
  // Rejects when the save fails, so the guard can stay on the page.
  save: () => Promise<void>
}

// `proceed` leaves, `reset` stays. For a navigation they come from the
// router's blocker resolver; for sign out the guard supplies them.
export type LeaveRequest = {
  intent: LeaveIntent
  proceed: () => void
  reset: () => void
}

type UnsavedChangesState = {
  draft: UnsavedDraft | null
  request: LeaveRequest | null
  setDraft: (draft: UnsavedDraft) => void
  clearDraft: () => void
  requestLeave: (request: LeaveRequest) => void
  clearRequest: () => void
}

// The editor registers its draft here while it is mounted, so the layout's guard
// and sign-out button can read it. Not persisted: the draft dies with the tab.
export const useUnsavedChangesStore = create<UnsavedChangesState>()((set) => ({
  draft: null,
  request: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null, request: null }),
  requestLeave: (request) => set({ request }),
  clearRequest: () => set({ request: null }),
}))

// Read straight from the store, so the blocker never decides from a stale value.
export const hasUnsavedChanges = () =>
  useUnsavedChangesStore.getState().draft?.isDirty === true
