import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import content from '#/content/terms-of-service.md?raw'
import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/regulamin')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const handleHomeButtonClicked = () => {
    navigate({ to: '/' })
  }

  return (
    <Page>
      <Button
        size="lg"
        className="p-6 w-full mb-6"
        onClick={handleHomeButtonClicked}
      >
        Powrót do strony głównej
      </Button>
      <article className="prose prose-neutral max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </Page>
  )
}
