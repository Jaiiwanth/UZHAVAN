import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Tamil } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil', 'latin'],
  variable: '--font-tamil',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UZHAVAR OS — CropChain Lens Workstation',
  description: 'Digital Passport and Transparent Price Lineage for Agricultural Produce',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍅</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${plusJakarta.variable} ${notoSansTamil.variable}`}
    >
      <body className="bg-background text-on-surface antialiased font-body-md text-body-md min-h-screen flex flex-col selection:bg-secondary-container selection:text-on-secondary">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
