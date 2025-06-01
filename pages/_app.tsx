import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

/**
 * Main App component that wraps all pages
 * Includes global styles and meta tags
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Wallify - Create Beautiful Lock Screen Wallpapers</title>
        <meta name="description" content="Create stylized to-do list wallpapers for your iPhone lock screen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}