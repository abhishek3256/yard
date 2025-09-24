import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Multi-Tenant Notes SaaS',
  description: 'A secure multi-tenant notes application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
