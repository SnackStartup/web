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
  start with `useApi`: `useApiAdminPlacesQuery`, `useApiIsAdminQuery`,
  `useApiSavePlaceMutation`. This includes auth hooks (`useApiLogoutMutation`,
  not `useLogoutMutation`).
- Helper exports that act on the cache take the full prefix:
  `apiAdminInvalidatePlaceQueries`.
- One `useQuery` per hook, written inline. Do not split a `queryOptions`
  factory out of a hook.
- Query results and mutations are assigned to variables named after what they
  load, not `query` or `data`: `adminPlacesQuery`, `adminPlaceQuery`,
  `apiIsAdminQuery`, `savePlace`, `logoutMutation`.
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
