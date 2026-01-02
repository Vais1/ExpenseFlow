import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border/50">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.svg"
                            alt="ExpenseFlow"
                            width={28}
                            height={28}
                            className="dark:brightness-110"
                        />
                        <span className="font-semibold text-foreground">ExpenseFlow</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-7xl font-bold text-primary mb-2">404</p>
                    <h1 className="text-xl font-semibold text-foreground mb-2">Page not found</h1>
                    <p className="text-muted-foreground mb-8 max-w-sm">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50">
                <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
                    <span>© 2026 ExpenseFlow</span>
                </div>
            </footer>
        </div>
    );
}
