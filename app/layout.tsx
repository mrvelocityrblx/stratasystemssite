import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Strata Systems - AI Solutions for the Future",
  description: "Strata Systems builds transformative AI products including EchoAI and DayWise to power your business.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/images/strata-logo.png" },
      { url: "/images/strata-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/strata-logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/strata-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
