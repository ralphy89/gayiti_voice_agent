import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'AI Outreach Console', description: 'Run and review AI-powered customer outreach.' }
export const viewport = { themeColor: '#f5f6f8', width: 'device-width', initialScale: 1 }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
