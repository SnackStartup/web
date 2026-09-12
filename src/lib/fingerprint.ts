import {
  hashComponents,
  loadSources,
  prepareForSources,
  sources,
} from '@fingerprintjs/fingerprintjs'

// fixes on some browsers
const EXCLUDED_SOURCES = ['languages', 'fonts', 'touchSupport'] as const

let cachedId: string | null = null

const fpPromise = (async () => {
  await prepareForSources()
  return loadSources(sources, { cache: {}, debug: false }, EXCLUDED_SOURCES)
})()

export const getFingerprint = async (): Promise<string> => {
  if (cachedId) return cachedId
  const getComponents = await fpPromise
  const components = await getComponents()
  cachedId = hashComponents(components)
  console.log('Visitor ID:', cachedId)
  return cachedId
}
