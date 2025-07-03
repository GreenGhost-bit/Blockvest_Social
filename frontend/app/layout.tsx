import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '../components/ui/wallet-provider';
import { ThemeProvider } from '../components/ui/theme-provider';
import Navigation from '../components/ui/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blockvest Social - Decentralized Social Investment Platform',
  description: 'A Web3 social investing platform running on Algorand blockchain, enabling investment in people without formal credit history.',
  keywords: ['blockchain', 'algorand', 'investment', 'social', 'web3', 'defi'],
  authors: [{ name: 'Blockvest Social Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Blockvest Social</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        A decentralized social investment platform built on Algorand blockchain. 
                        Connecting investors with individuals who need funding, creating opportunities 
                        for everyone to participate in the economy.
                      </p>
                      <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                          <span className="sr-only">Twitter</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                          <span className="sr-only">GitHub</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                          <span className="sr-only">Discord</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.942 8.5c0-.41-.077-.82-.225-1.21.148-.39.225-.8.225-1.21 0-1.48-.635-2.818-1.65-3.76C14.245 1.315 12.81.5 11.16.5c-.68 0-1.335.135-1.935.405-.6-.27-1.255-.405-1.935-.405-1.65 0-3.085.815-4.132 1.82C2.135 3.262 1.5 4.6 1.5 6.08c0 .41.077.82.225 1.21-.148.39-.225.8-.225 1.21 0 1.48.635 2.818 1.65 3.76C4.195 13.315 5.63 14.13 7.28 14.13c.68 0 1.335-.135 1.935-.405.6.27 1.255.405 1.935.405 1.65 0 3.085-.815 4.132-1.82 1.015-.942 1.65-2.28 1.65-3.76z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                        Platform
                      </h3>
                      <ul className="space-y-2">
                        <li><a href="/explore" className="text-gray-600 hover:text-gray-900">Explore</a></li>
                        <li><a href="/investments" className="text-gray-600 hover:text-gray-900">Investments</a></li>
                        <li><a href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</a></li>
                        <li><a href="/reputation" className="text-gray-600 hover:text-gray-900">Reputation</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                        Support
                      </h3>
                      <ul className="space-y-2">
                        <li><a href="/about" className="text-gray-600 hover:text-gray-900">About</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className="text-gray-600 text-sm">
                        © 2024 Blockvest Social. All rights reserved.
                      </p>
                      <p className="text-gray-600 text-sm mt-2 md:mt-0">
                        Built on Algorand blockchain with ❤️
                      </p>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}