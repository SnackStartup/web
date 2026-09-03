import { HomeContact } from '#/components/home/HomeContact'
import { HomeFeatures } from '#/components/home/HomeFeatures'
import { HomeHero } from '#/components/home/HomeHero'
import { HomeHowItWorks } from '#/components/home/HomeHowItWorks'
import { Page } from '#/components/Page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <Page>
      <HomeHero />
      <div className="my-20" />
      <HomeHowItWorks />
      <div className="my-20" />
      <HomeFeatures />
      <div className="my-20" />
      <HomeContact />
    </Page>
  )
}
