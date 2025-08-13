import './globals.css';
import { AuthProvider } from '@/lib/auth';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Language Coach',
  description: 'Track your spoken English and improve with AI‑powered feedback.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}