import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Roboto } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/frontend/components/navigation"
import { WalletProvider } from "@/frontend/components/wallet-provider"
import { ThemeProvider } from "@/frontend/components/theme-provider"
import { Toaster } from "@/frontend/components/ui/toaster"
import { Analytics } from "@/frontend/components/analytics"

// Optimized font loading with display swap for better performance
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
})

// Enhanced metadata for better SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL("https://blockvest-social.com"),
  title: {
    default: "Blockvest Social - Decentralized Micro-Investment Platform",
    template: "%s | Blockvest Social"
  },
  description: "Empowering entrepreneurs through blockchain-based micro-investments and DeFi solutions. Connect, invest, and grow with Web3 technology.",
  keywords: [
    "blockchain",
    "cryptocurrency",
    "DeFi",
    "micro-investment",
    "Web3",
    "decentralized finance",
    "social investing",
    "entrepreneur funding"
  ],
  authors: [{ name: "Blockvest Social Team" }],
  creator: "Blockvest Social",
  publisher: "Blockvest Social",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blockvest-social.com",
    siteName: "Blockvest Social",
    title: "Blockvest Social - Decentralized Micro-Investment Platform",
    description: "Empowering entrepreneurs through blockchain-based micro-investments and DeFi solutions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blockvest Social - Decentralized Investment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blockvest Social - Decentralized Micro-Investment Platform",
    description: "Empowering entrepreneurs through blockchain-based micro-investments and DeFi solutions",
    images: ["/twitter-image.png"],
    creator: "@BlockvestSocial",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#1e293b",
      },
    ],
  },
  category: "finance",
}

// Optimized viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security headers */}
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Blockvest Social" />
        
        {/* Prevent zoom on iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body 
        className={`${inter.variable} ${roboto.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <WalletProvider>
            <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-navy-dark to-slate-800">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5" />
              
              {/* Skip to main content for accessibility */}
              <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all"
              >
                Skip to main content
              </a>
              
              {/* Navigation */}
              <Navigation />
              
              {/* Main Content */}
              <main 
                id="main-content"
                className="relative pt-16 text-white selection:bg-blue-500/20 selection:text-blue-100"
              >
                <div className="relative z-10">
                  {children}
                </div>
              </main>
              
              {/* Global components */}
              <Toaster />
              
              {/* Scroll to top button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 opacity-0 translate-y-4 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Scroll to top"
                style={{
                  opacity: 'var(--scroll-opacity, 0)',
                  transform: 'translateY(var(--scroll-transform, 16px))'
                }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 10l7-7m0 0l7 7m-7-7v18" 
                  />
                </svg>
              </button>
            </div>
          </WalletProvider>
        </ThemeProvider>
        
        {/* Analytics */}
        <Analytics />
        
        {/* Scroll behavior script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const scrollButton = document.querySelector('[aria-label="Scroll to top"]');
                if (!scrollButton) return;
                
                function updateScrollButton() {
                  const scrolled = window.scrollY > 300;
                  scrollButton.style.setProperty('--scroll-opacity', scrolled ? '1' : '0');
                  scrollButton.style.setProperty('--scroll-transform', scrolled ? '0px' : '16px');
                }
                
                window.addEventListener('scroll', updateScrollButton, { passive: true });
                updateScrollButton();
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}