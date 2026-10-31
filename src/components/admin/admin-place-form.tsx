import type { ApiAdminPlaceInput } from '#/api/admin/types'
import { AdminGooglePlaceField } from '#/components/admin/admin-google-place-field'
import { Checkbox } from '#/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'

type ColorSchemeChoice = 'auto' | 'light' | 'dark'

export type AdminPlaceFormProps = {
  value: ApiAdminPlaceInput
  // The stored Google id, so the venue field can tell a saved link from one just
  // picked.
  savedGooglePlaceId: string | null
  isNew: boolean
  onChange: <TKey extends keyof ApiAdminPlaceInput>(
    key: TKey,
    value: ApiAdminPlaceInput[TKey],
  ) => void
}

export const AdminPlaceForm: React.FC<AdminPlaceFormProps> = ({
  value,
  savedGooglePlaceId,
  isNew,
  onChange,
}) => {
  const colorScheme: ColorSchemeChoice = value.color_scheme ?? 'auto'

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="place-id">Id (slug)</FieldLabel>
          <Input
            id="place-id"
            value={value.id}
            disabled={!isNew}
            onChange={(event) => onChange('id', event.target.value)}
          />
          <FieldDescription>
            Do not change it once the QR is printed.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="place-name">Name</FieldLabel>
          <Input
            id="place-name"
            value={value.name}
            onChange={(event) => onChange('name', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-suffix">Suffix (e.g. Café)</FieldLabel>
          <Input
            id="place-suffix"
            value={value.suffix ?? ''}
            onChange={(event) => onChange('suffix', event.target.value || null)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-location">Location</FieldLabel>
          <Input
            id="place-location"
            value={value.location}
            onChange={(event) => onChange('location', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-instagram">Instagram URL</FieldLabel>
          <Input
            id="place-instagram"
            value={value.instagram_url}
            onChange={(event) => onChange('instagram_url', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-facebook">Facebook URL</FieldLabel>
          <Input
            id="place-facebook"
            value={value.facebook_url}
            onChange={(event) => onChange('facebook_url', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-wifi-ssid">WiFi SSID</FieldLabel>
          <Input
            id="place-wifi-ssid"
            value={value.wifi_ssid}
            onChange={(event) => onChange('wifi_ssid', event.target.value)}
          />
          <FieldDescription>
            Shown to every guest on the place page.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="place-wifi-password">WiFi password</FieldLabel>
          <Input
            id="place-wifi-password"
            value={value.wifi_password}
            onChange={(event) => onChange('wifi_password', event.target.value)}
          />
          <FieldDescription>Leave empty for an open network.</FieldDescription>
        </Field>
      </div>

      <AdminGooglePlaceField
        value={value.google_place_id ?? null}
        placeId={value.id}
        savedGooglePlaceId={savedGooglePlaceId}
        isNew={isNew}
        onChange={(next) => onChange('google_place_id', next)}
      />

      <Field>
        <FieldLabel htmlFor="place-description">Description</FieldLabel>
        <Textarea
          id="place-description"
          rows={3}
          value={value.description}
          onChange={(event) => onChange('description', event.target.value)}
        />
        <FieldDescription>
          Wrap a few words in asterisks to highlight them, for example *fresh
          pastry*.
        </FieldDescription>
      </Field>

      <div className="grid gap-4 md:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="place-primary-color">Primary color</FieldLabel>
          <Input
            id="place-primary-color"
            type="color"
            className="h-10 px-1"
            value={value.primary_color}
            onChange={(event) => onChange('primary_color', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-background-opacity">
            Background opacity
          </FieldLabel>
          <Input
            id="place-background-opacity"
            placeholder="e.g. 40%"
            value={value.background_opacity ?? ''}
            onChange={(event) =>
              onChange('background_opacity', event.target.value || null)
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-color-scheme">Theme</FieldLabel>
          <Select
            value={colorScheme}
            onValueChange={(choice) =>
              onChange('color_scheme', choice === 'auto' ? null : choice)
            }
          >
            <SelectTrigger id="place-color-scheme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">auto</SelectItem>
              <SelectItem value="light">light</SelectItem>
              <SelectItem value="dark">dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="place-coffee-budget">Coffee budget</FieldLabel>
          <Input
            id="place-coffee-budget"
            type="number"
            min={0}
            value={value.coffee_budget}
            onChange={(event) =>
              onChange('coffee_budget', Number(event.target.value))
            }
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={value.neon}
            onCheckedChange={(checked) => onChange('neon', checked === true)}
          />
          Neon
        </Label>
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={value.is_published}
            onCheckedChange={(checked) =>
              onChange('is_published', checked === true)
            }
          />
          Published
        </Label>
      </div>
    </div>
  )
}
