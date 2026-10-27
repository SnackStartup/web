import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Tokens = { access_token: string; refresh_token: string }

type AuthTokenState = {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (tokens: Tokens) => void
  clearTokens: () => void
}

const initial = {
  accessToken: null,
  refreshToken: null,
}

// persist keeps the session in localStorage across reloads. React needs the
// store as well: clearing only the storage leaves every mounted screen showing
// the signed-in admin until something else re-renders.
//
// localStorage hydrates synchronously, so the state is in place by the time this
// module finishes loading and the transport can read a token right away.
export const useAuthTokenStore = create<AuthTokenState>()(
  persist(
    (set) => ({
      ...initial,
      setTokens: ({ access_token, refresh_token }) =>
        set({ accessToken: access_token, refreshToken: refresh_token }),
      clearTokens: () => {
        set(initial)
        // persist would leave the key behind holding two nulls. Signing out
        // should leave nothing at all.
        void useAuthTokenStore.persist.clearStorage()
      },
    }),
    {
      name: 'auth-state',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, refreshToken }) => ({
        accessToken,
        refreshToken,
      }),
    },
  ),
)

// The transport, the admin gate and the wallet read the session outside a
// render, so they take it from the store rather than subscribing to it.
export const getAccessToken = () => useAuthTokenStore.getState().accessToken
export const getRefreshToken = () => useAuthTokenStore.getState().refreshToken
