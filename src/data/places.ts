export type Place = {
  suffix?: string
  name: string
  location: string
  instagramUrl: string
  facebookUrl: string
  description: string
  galleryCount: number
  primaryColor: string
  backgroundOpacity?: string
  colorScheme?: 'dark' | 'light'
}

export const places = {
  '1': {
    suffix: 'Klubokawiarnia',
    name: 'Pod Kocim Ogonem',
    location: 'Bydgoszcz, ul. Długa 36',
    instagramUrl:
      'https://www.instagram.com/podkocimogonem?igsi=MTZhdTdjbnI0dmQ2Ng==',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61589769376486',
    description: `
      Uchwyciłeś pyszne danie, *uroczy moment z kotem* albo
      świetną chwilę u nas? Podziel się zdjęciami! Pomóż innym odkryć nasz
      klimat, a *najpiękniejsze kadry znajdziesz na naszym profilu!*
    `,
    galleryCount: 8,
    primaryColor: '#d33886',
  },
  zapalka: {
    suffix: 'Kawiarnia',
    name: 'ZaPaŁka',
    location: 'Bydgoszcz, ul. Długa 33',
    instagramUrl: 'https://www.instagram.com/zapalkacoffee/',
    facebookUrl: 'https://www.facebook.com/zapalkacoffee',
    description: `
      Pokaż, co u nas dzisiaj próbujesz!
      Wrzuć fotkę ciasta lub kawy – *najlepsze kadry udostępnimy na naszym profilu!*.
    `,
    galleryCount: 10,
    primaryColor: '#a57b62',
    backgroundOpacity: '30%',
  },
  oops: {
    suffix: 'Bar',
    name: 'OOPS',
    location: 'Bydgoszcz, ul. Długa 43',
    instagramUrl: 'https://www.instagram.com/oopsbar_bdg/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61578089699821',
    description: `
      Jak tam dzisiejszy wieczór w OOPS?
      Wrzuć fotkę drinka lub ekipy – *najlepsze ujęcia udostępnimy na naszym profilu!*
    `,
    galleryCount: 6,
    primaryColor: '#805ae5',
    backgroundOpacity: '30%',
    colorScheme: 'dark',
  },
} as const satisfies Record<string, Place>
