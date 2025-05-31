import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QuizProvider } from '@/contexts/QuizContext';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CEH Self-Paced',
  description: 'Practice for your CEH exam with interactive quizzes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <QuizProvider>
          <header className="bg-card border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                CEH Self-Paced
              </Link>
              <nav>
                <Button variant="ghost" asChild>
                  <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/practice">Practice</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/exam">Exam</Link>
                </Button>
              </nav>
            </div>
          </header>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
          <footer className="bg-card border-t py-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CEH Self-Paced. All rights reserved.</p>
          </footer>
        </QuizProvider>
      </body>
    </html>
  );
}
