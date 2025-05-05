// app/layout.tsx (server component)
import type { Metadata } from 'next';
import globals from '../utils/globals';
import ClientLayout from './clientlayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: globals.metaData.title,
  description: globals.metaData.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
