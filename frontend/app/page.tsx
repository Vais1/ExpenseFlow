'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText, Users, Shield, History } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/logo.svg"
                            alt="ExpenseFlow"
                            width={32}
                            height={32}
                            className="dark:brightness-110"
                        />
                        <span className="text-lg font-semibold text-foreground tracking-tight">ExpenseFlow</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/auth/login"
                            className="px-4 py-2 text-sm font-medium text-muted-foreground"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-6xl mx-auto px-6">
                <section className="py-24 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium text-primary bg-primary/10 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Invoice management for modern teams
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                        Invoice approval,<br />simplified
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                        Track vendor invoices, manage approvals, and keep your finance team aligned—all in one place.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-lg"
                        >
                            Start for free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-foreground bg-card border border-border rounded-lg"
                        >
                            Login
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Invoice Management</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Create, submit, and track invoices through a straightforward approval workflow.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Vendor Directory</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Organize vendors by category and keep contact details in one place.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Role-based Access</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Users submit, managers approve, admins configure. Simple permissions.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <History className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Activity Tracking</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Full audit trail for every invoice—submissions, approvals, rejections.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Architecture */}
                <section className="py-16 border-t border-border/40">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center mb-8">
                        Built with modern tools
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-foreground">Frontend</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">Next.js 15</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">React 19</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">TypeScript</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">Tailwind CSS</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">shadcn/ui</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">TanStack Query</div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-foreground">Backend</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">ASP.NET Core 8</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">C# 12</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">EF Core</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">Neon Postgres</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">JWT Auth</div>
                                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">REST API</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 mt-16">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="ExpenseFlow" width={20} height={20} className="opacity-60" />
                        <span>© 2026 ExpenseFlow</span>
                    </div>
                    <span>Built with Next.js & .NET</span>
                </div>
            </footer>
        </div>
    );
}
