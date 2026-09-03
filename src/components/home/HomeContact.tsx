import { MailIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

export const HomeContact: React.FC = () => {
  const [form, setForm] = useState({ topic: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[Stolik] ${form.topic || 'Wiadomość'}`)
    const body = encodeURIComponent(form.message)
    window.location.href = `mailto:stolikpic@gmail.com?subject=${subject}&body=${body}`
  }

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <section id="kontakt" className="container mx-auto px-4">
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold md:text-4xl">
            Skontaktuj się z nami
          </h2>
          <p className="text-muted-foreground">
            Masz pytania, propozycję współpracy albo chcesz, aby Twoja
            restauracja dołączyła do Stolik? Napisz do nas.
          </p>
          <a
            href="mailto:stolikpic@gmail.com"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <MailIcon className="size-5" /> stolikpic@gmail.com
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Napisz do nas</CardTitle>
            <CardDescription>
              Wypełnij formularz, a wiadomość otworzy się w Twoim programie
              pocztowym.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="topic">Temat</Label>
                <Input
                  id="topic"
                  value={form.topic}
                  onChange={update('topic')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Wiadomość</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                />
              </div>

              <Button type="submit" size="lg">
                <MailIcon data-icon="inline-start" /> Wyślij wiadomość
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
