import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import {
  importPlace,
  useAdminPlacesQuery,
} from '#/api/admin/client'
import type { AdminPlace, PlaceExport } from '#/api/admin/client'

export const Route = createFileRoute('/admin/')({
  component: AdminPlaces,
})

function AdminPlaces() {
  const query = useAdminPlacesQuery()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFile = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      let payload = JSON.parse(await file.text()) as PlaceExport
      let created: AdminPlace

      try {
        created = await importPlace(payload)
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 409) {
          const newId = window.prompt(
            'Id already exists. Enter a new id:',
            `${payload.place.id}-copy`,
          )
          if (!newId) return
          payload = {
            ...payload,
            place: { ...payload.place, id: newId.trim().toLowerCase() },
          }
          created = await importPlace(payload)
        } else {
          throw err
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'places'] })
      await navigate({
        to: '/admin/place/$id',
        params: { id: created.id },
      })
    } catch {
      setError(
        'Import failed. The file must come from "Export" in Stolik admin.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Places</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy ? 'Importing…' : 'Import place'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void importFile(file)
            }}
          />
          <Link
            to="/admin/place/$id"
            params={{ id: 'new' }}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            New place
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-neutral-500">
        Import creates a draft. Export a place from its editor to move it between
        environments (e.g. staging → prod).
      </p>

      {query.isLoading && <p className="text-sm text-neutral-500">Loading…</p>}

      {query.data?.length === 0 && (
        <p className="text-sm text-neutral-500">No places yet.</p>
      )}

      <ul className="flex flex-col divide-y rounded border">
        {query.data?.map((place) => (
          <li key={place.id}>
            <Link
              to="/admin/place/$id"
              params={{ id: place.id }}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{place.name}</span>
                <span className="truncate text-xs text-neutral-500">
                  {place.id} · {place.location}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-xs">
                <span
                  className={
                    place.is_published
                      ? 'rounded bg-green-100 px-2 py-0.5 text-green-800'
                      : 'rounded bg-neutral-100 px-2 py-0.5 text-neutral-600'
                  }
                >
                  {place.is_published ? 'published' : 'draft'}
                </span>
                <span className="text-neutral-500">
                  {place.gallery.length} photos
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
