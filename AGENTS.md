<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Conventions

Preferences for everything under `web/src`. Follow them for new code and when
touching existing files.

## Naming

Prefixes carry the meaning, so no name is ambiguous out of context.

- Payload types are Zod schemas, and the exported TypeScript type is inferred
  from the schema. The schema takes a `z` prefix, the type keeps the plain name:

  ```ts
  export const zApiAdminPlace = z.object({ ... })
  export type ApiAdminPlace = z.infer<typeof zApiAdminPlace>
  ```

- Every API call is a TanStack Query hook, never a plain fetch function. Hooks
  start with `useApi` and read as `<resource><action>`, and a call into the
  admin area carries the area: `useApiAdminPlaceSaveMutation`,
  `useApiAdminGalleryReorderMutation`, `useApiAdminPaymentTokenRotateMutation`.
  Never `useApiPlaceSaveMutation` or `useApiGalleryReorderMutation`. Public
  calls keep the resource alone: `useApiPlacesQuery`,
  `useApiPaymentsCreateCheckoutSessionMutation`. A name with no resource plus
  action split keeps its natural shape: `useApiIsAdminQuery`,
  `useApiAdminMeQuery`. This includes auth hooks (`useApiLogoutMutation`, not
  `useLogoutMutation`).
- Helper exports that act on the cache take the full prefix:
  `apiAdminInvalidatePlaceQueries`.
- One `useQuery` per hook, written inline. Do not split a `queryOptions`
  factory out of a hook.
- A query or mutation result is assigned to the hook name without `use`, so the
  variable always starts with `api`:

  ```ts
  const apiAdminPlaceSaveMutation = useApiAdminPlaceSaveMutation()
  const apiPlacesQuery = useApiPlacesQuery()
  ```

  Never `savePlace`, `placesQuery`, `query` or `data`.

- On-demand reads (a button that fetches on click) are still queries: render
  them with `enabled: false` and drive them with `refetch()`, never with a
  hand-rolled `isExporting` boolean.
- Components are one per file, PascalCase, named the same as the file
  (`AdminGalleryEditor` in `admin-gallery-editor.tsx`).

## API layer layout

`src/api/<area>/` holds one action per file. Do not put several hooks in one
module.

The filename is the hook name with `Api` and the area dropped: the hook
`useApiAdminPlacesQuery` lives in `admin/use-places-query.ts`, and
`useApiPaymentsCreateCheckoutSessionMutation` lives in
`payments/use-create-checkout-session-mutation.ts`.

```
types.ts                            zApi* schemas + Api* inferred types
use-<hook>-query.ts                 useApi<Thing>Query
use-<hook>-mutation.ts              useApi<Thing>Mutation
invalidate-place-queries.ts         apiAdminInvalidatePlaceQueries
```

- Query keys live in `src/api/query-keys.ts` (`adminKeys`, `placeKeys`). Never
  write key arrays inline in a component.
- Shared cache invalidation lives in `src/api/admin/invalidate-place-queries.ts`.
  A mutation that changes a place calls `apiAdminInvalidatePlaceQueries`.
- Admin text is English. Guest-facing copy in `place-view.tsx` stays Polish.

## Stores

- Every zustand store lives in `src/stores/`, one per file. Nothing that holds
  app state belongs in `src/lib/`, which is for pure helpers and one-shot
  utilities.
- A store owns both its state and the actions that change it
  (`setTokens`, `clearTokens`, `saveUpload`). A module outside `src/stores/`
  must not write that state by hand.
- Non-React callers (the axios client, the router guards) read through
  `useAuthTokenStore.getState()` or a small exported reader such as
  `getAccessToken`, never through a subscription.
- State that has to survive a reload uses the `persist` middleware with
  `createJSONStorage(() => localStorage)`, one storage key per store
  (`auth-state`, `thanks-state`), never hand-rolled `localStorage` calls. The
  rest stays in memory (`unsaved-changes-store`).
- `persist` hydrates synchronously for `localStorage`, so a store is already
  filled in when its module finishes loading. A reader such as `getAccessToken`
  works on the first line of any module, and an absent `localStorage` degrades
  the store to a plain in-memory one instead of throwing.

## Components

- Route files stay thin: read params, run one query, render one component.
  Everything else moves to `src/components/<area>/`.
- One component per file. Split rather than stacking several in a route.
- UI comes from `src/components/ui/*` (base-ui wrappers). Do not hand-roll
  `<button>`, `<input>`, `<select>` or `<textarea>`, and do not use
  `window.confirm` or `window.prompt`. Use `Dialog` /
  `AdminConfirmDialog` for confirmations and `Select` for dropdowns.
- Loading state comes from the mutation itself (`savePlace.isPending`). Do not
  thread a shared `busy` boolean through props, and do not disable the whole
  form because one request is in flight.
- The enlarged-image viewer is `src/components/image-lightbox.tsx`. The guest
  gallery and every admin panel use that one component.
- The admin-only way back into the panel is `AdminLink`
  (`src/components/admin/admin-link.tsx`), used by the header and the guest page.
  It stays small: red fill, no bold or uppercase, trailing arrow. A red badge
  with loud type is too much for guest-facing chrome.

## Environment and data

- Environment and public URLs come from Vite via `src/lib/env.ts`
  (`appEnvironment`, `isProdEnvironment`, `getPublicWebUrl`), not from
  `GET /admin/me`. `/admin/me` is only for the auth gate and the admin email.
- Payload converters live in `src/lib/admin.ts` next to each other:
  `adminPlaceToPlaceInput`, `emptyAdminPlaceInput`, `adminPlaceToApiPlace`.
- Limits that mirror the backend (gallery size, upload size) are declared as a
  named constant at the top of the component that enforces them.

## Prose

No em dashes in UI copy, comments or docs. Use a normal sentence or a colon.
