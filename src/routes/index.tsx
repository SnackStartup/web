import { Page } from '#/components/Page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <Page>Snack</Page>
}
