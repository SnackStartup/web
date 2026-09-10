import { HomeContact } from '#/components/home/home-contact'
import { HomeFeatures } from '#/components/home/home-features'
import { HomeHero } from '#/components/home/home-hero'
import { HomeHowItWorks } from '#/components/home/home-how-it-works'
import { Page } from '#/components/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <Page>
      <div className="mx-auto w-full max-w-6xl">
        <HomeHero />
        <div className="my-20" />
        <HomeHowItWorks />
        <div className="my-20" />
        <HomeFeatures />
        <div className="my-20" />
        <HomeContact />
      </div>
    </Page>
  )
}
