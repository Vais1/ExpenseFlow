'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Wallet } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { authService, AuthSession } from '@/services/auth';
import { useRouter } from 'next/navigation';

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState<AuthSession | null>(null);
    const router = useRouter();

    useEffect(() => {
        const currentSession = authService.getSession();
        setSession(currentSession);
    }, []);

    const handleLogout = () => {
        authService.logout();
        router.push('/auth/login');
    };

    if (!session) return null;

    const role = session.user.role || 'User';

    return (
        <div className="md:hidden flex items-center justify-between p-4 bg-background border-b h-16 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm">VendorPay</span>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[300px] p-0 gap-0">
                    <SheetHeader className="p-4 border-b bg-muted/20 text-left">
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Wallet className="h-4 w-4 text-primary-foreground" />
                            </div>
                            VendorPay
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col h-full justify-between pb-8">
                        <div className="p-4">
                            <SidebarNav
                                role={role}
                                onNavigate={() => setOpen(false)}
                            />
                        </div>

                        <div className="p-4 border-t mt-auto">
                            <div className="flex items-center gap-3 mb-4 p-2 bg-muted/50 rounded-md">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{session.user.username}</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">{role}</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full gap-2 justify-start text-muted-foreground hover:text-destructive hover:border-destructive/50"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
