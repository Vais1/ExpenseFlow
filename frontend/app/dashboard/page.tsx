'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const session = authService.getSession();

        if (session?.user?.role) {
            // Redirect based on role
            // 'User' -> My Requests
            // 'Management', 'Admin' -> Approvals
            if (session.user.role === 'User') {
                router.replace('/dashboard/my-requests');
            } else {
                router.replace('/dashboard/approvals');
            }
        } else {
            router.replace('/auth/login');
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground animate-pulse">Redirecting to your workspace...</p>
        </div>
    );
}
