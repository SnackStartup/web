import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  deleteGalleryImage,
  exportPlace,
  fetchQrBlob,
  reorderGallery,
  revokePaymentToken,
  rotatePaymentToken,
  savePlace,
  uploadBrand,
  uploadGallery,
  useAdminMeQuery,
  useAdminPlaceQuery,
  useDeletePlaceMutation,
} from '#/api/admin/client'
import type { AdminPlace, PlaceInput } from '#/api/admin/client'
import { EMPTY_PLACE, toInput } from '#/lib/admin'
import { Spinner } from '#/components/ui/spinner'
import { ArrowLeft, ArrowRight, Eye, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/place/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const isNew = id === 'new'
  const query = useAdminPlaceQuery(isNew ? '' : id)

  if (!isNew && query.isLoading) return <Spinner />
  if (!isNew && !query.data)
    return <p className="text-sm text-neutral-500">Place not found.</p>

  return <Editor key={id} isNew={isNew} place={query.data} />
}

function Editor({ isNew, place }: { isNew: boolean; place?: AdminPlace }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deletePlace = useDeletePlaceMutation()
  const [form, setForm] = useState<PlaceInput>(() =>
    place ? toInput(place) : { ...EMPTY_PLACE },
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const set = <TKey extends keyof PlaceInput>(
    key: TKey,
    value: PlaceInput[TKey],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const refresh = async (placeId: string) => {
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'place', placeId],
    })
    await queryClient.invalidateQueries({ queryKey: ['admin', 'places'] })
    await queryClient.invalidateQueries({ queryKey: ['place', placeId] })
    await queryClient.invalidateQueries({ queryKey: ['places'] })
  }

  const save = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const saved = await savePlace(
        { ...form, id: form.id.trim().toLowerCase() },
        isNew,
      )
      await refresh(saved.id)
      setMessage('Saved')
      if (isNew) {
        await navigate({
          to: '/admin/place/$id',
          params: { id: saved.id },
          replace: true,
        })
      } else {
        setForm(toInput(saved))
      }
    } catch {
      setMessage('Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const downloadExport = async () => {
    if (!place) return
    setBusy(true)
    setMessage(null)
    try {
      const payload = await exportPlace(place.id)
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${place.id}.stolik.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setMessage('Export failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {place && (
        <div className="flex justify-center">
          <Link
            to="/admin/preview/$id"
            params={{ id: place.id }}
            className="inline-flex items-center gap-2 rounded border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Eye className="size-4" />
            Preview page
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Id (slug, do not change once the QR is printed)">
          <input
            value={form.id}
            disabled={!isNew}
            onChange={(e) => set('id', e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </Field>
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Suffix (e.g. Café)">
          <input
            value={form.suffix ?? ''}
            onChange={(e) => set('suffix', e.target.value || null)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Instagram URL">
          <input
            value={form.instagram_url}
            onChange={(e) => set('instagram_url', e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Facebook URL">
          <input
            value={form.facebook_url}
            onChange={(e) => set('facebook_url', e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Primary color">
          <input
            type="color"
            value={form.primary_color}
            onChange={(e) => set('primary_color', e.target.value)}
            className="h-10 w-full rounded border"
          />
        </Field>
        <Field label="Background opacity">
          <input
            value={form.background_opacity ?? ''}
            onChange={(e) => set('background_opacity', e.target.value || null)}
            placeholder="e.g. 40%"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Theme">
          <select
            value={form.color_scheme ?? ''}
            onChange={(e) =>
              set(
                'color_scheme',
                (e.target.value || null) as 'dark' | 'light' | null,
              )
            }
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </Field>
        <Field label="Coffee budget">
          <input
            type="number"
            min={0}
            value={form.coffee_budget}
            onChange={(e) => set('coffee_budget', Number(e.target.value))}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.neon}
            onChange={(e) => set('neon', e.target.checked)}
          />
          Neon
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        {message && <span className="text-sm text-neutral-500">{message}</span>}
        {!isNew && place && (
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadExport()}
              className="rounded border px-4 py-2 text-sm disabled:opacity-50"
            >
              Export
            </button>
            <button
              type="button"
              disabled={busy || deletePlace.isPending}
              onClick={() => {
                if (
                  !window.confirm(
                    'Delete this place and all of its photos? This cannot be undone.',
                  )
                )
                  return
                void deletePlace
                  .mutateAsync(place.id)
                  .then(() => navigate({ to: '/admin' }))
              }}
              className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
            >
              Delete place
            </button>
          </div>
        )}
      </div>

      {!isNew && place && (
        <>
          <hr />
          <h2 className="font-semibold">Images</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ImageSlot
              label="Logo"
              url={place.logo_url}
              busy={busy}
              onPreview={setPreview}
              onUpload={async (file) => {
                setBusy(true)
                try {
                  await uploadBrand(place.id, 'logo', file)
                  await refresh(place.id)
                } finally {
                  setBusy(false)
                }
              }}
            />
            <ImageSlot
              label="Background"
              url={place.background_url}
              busy={busy}
              onPreview={setPreview}
              onUpload={async (file) => {
                setBusy(true)
                try {
                  await uploadBrand(place.id, 'background', file)
                  await refresh(place.id)
                } finally {
                  setBusy(false)
                }
              }}
            />
          </div>

          <GalleryEditor
            place={place}
            onChanged={() => refresh(place.id)}
            onPreview={setPreview}
          />
          <QrPanel placeId={place.id} onPreview={setPreview} />
          <PaymentPanel place={place} onChanged={() => refresh(place.id)} />
        </>
      )}

      <ImageLightbox src={preview} onClose={() => setPreview(null)} />
    </section>
  )
}

function ImageLightbox({
  src,
  onClose,
}: {
  src: string | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!src) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      {children}
    </label>
  )
}

function ImageSlot({
  label,
  url,
  busy,
  onUpload,
  onPreview,
}: {
  label: string
  url: string
  busy: boolean
  onUpload: (file: File) => Promise<void>
  onPreview: (url: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex items-center gap-4">
        {url ? (
          <button
            type="button"
            title="Click to enlarge"
            onClick={() => onPreview(url)}
            className="size-24 cursor-pointer overflow-hidden rounded border bg-neutral-100"
          >
            <img src={url} alt="" className="size-full object-cover" />
          </button>
        ) : (
          <div className="grid size-24 place-items-center rounded border bg-neutral-100">
            <span className="text-xs text-neutral-400">none</span>
          </div>
        )}
        <label className="cursor-pointer rounded border px-3 py-2 text-sm">
          {busy ? 'Uploading…' : 'Change'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onUpload(file)
              e.target.value = ''
            }}
          />
        </label>
      </div>
    </div>
  )
}

function GalleryEditor({
  place,
  onChanged,
  onPreview,
}: {
  place: AdminPlace
  onChanged: () => Promise<void>
  onPreview: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  const move = (from: number, to: number) => {
    const ids = place.gallery.map((image) => image.id)
    if (to < 0 || to >= ids.length) return
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    void run(() => reorderGallery(place.id, ids))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600">
          Gallery ({place.gallery.length}/12)
        </span>
        <button
          type="button"
          disabled={busy || place.gallery.length >= 12}
          onClick={() => inputRef.current?.click()}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            e.target.value = ''
            if (files.length) void run(() => uploadGallery(place.id, files))
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {place.gallery.map((image, index) => (
          <div key={image.id} className="flex flex-col gap-1">
            <button
              type="button"
              title="Click to enlarge"
              onClick={() => onPreview(image.full_url || image.tile_url)}
              className="cursor-pointer overflow-hidden rounded"
            >
              <img
                src={image.tile_url}
                alt=""
                className="aspect-square w-full rounded object-cover"
              />
            </button>
            <div className="flex items-stretch gap-1">
              <button
                type="button"
                aria-label="Move earlier"
                title="Move earlier"
                disabled={busy || index === 0}
                onClick={() => move(index, index - 1)}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded border text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Delete photo"
                title="Delete photo"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm('Delete this photo?')) return
                  void run(() => deleteGalleryImage(place.id, image.id))
                }}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded border text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Move later"
                title="Move later"
                disabled={busy || index === place.gallery.length - 1}
                onClick={() => move(index, index + 1)}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded border text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaymentPanel({
  place,
  onChanged,
}: {
  place: AdminPlace
  onChanged: () => Promise<void>
}) {
  const me = useAdminMeQuery()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const link = place.payment_token
    ? `${me.data?.public_web_url ?? ''}/pay/${place.payment_token}`
    : null

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy the link:', link)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">Payments</h2>
      <p className="text-xs text-neutral-500">
        The payment link belongs to this place. Generating a new one invalidates
        the old link.
      </p>

      {link ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={link}
              className="min-w-0 flex-1 rounded border bg-neutral-50 px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={() => void copy()}
              className="rounded border px-3 py-2 text-sm"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    'Generate a new link? The old one will stop working.',
                  )
                )
                  return
                void run(() => rotatePaymentToken(place.id))
              }}
              className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            >
              Rotate link
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!window.confirm('Revoke the payment link?')) return
                void run(() => revokePaymentToken(place.id))
              }}
              className="rounded border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
            >
              Revoke
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(() => rotatePaymentToken(place.id))}
          className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate payment link'}
        </button>
      )}
    </div>
  )
}

function QrPanel({
  placeId,
  onPreview,
}: {
  placeId: string
  onPreview: (url: string) => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    fetchQrBlob(placeId, 'png')
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => setError(true))

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [placeId])

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">QR code</h2>
      {error && (
        <p className="text-sm text-red-600">Could not load the QR code.</p>
      )}
      {url ? (
        <>
          <button
            type="button"
            title="Click to enlarge"
            onClick={() => onPreview(url)}
            className="w-fit cursor-pointer"
          >
            <img
              src={url}
              alt="QR code"
              className="size-48 rounded border bg-white p-2"
            />
          </button>
          <a
            href={url}
            download={`${placeId}-qr.png`}
            className="w-fit rounded border px-3 py-2 text-sm"
          >
            Download PNG
          </a>
        </>
      ) : (
        !error && <Spinner />
      )}
    </div>
  )
}
