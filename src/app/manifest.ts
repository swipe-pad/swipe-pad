import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SwipePad',
    short_name: 'SwipePad',
    description: 'Swipe to support regenerative projects on Celo',
    start_url: '/',
    display: 'standalone',
    background_color: '#070b14', // From our deep midnight blue palette
    theme_color: '#ffd600', // Our brand yellow
    icons: [
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
