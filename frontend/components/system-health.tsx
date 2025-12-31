'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function SystemHealth() {
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await api.get('/health');
                setIsHealthy(true);
            } catch (error) {
                console.error('System health check failed:', error);
                setIsHealthy(false);
                toast.error('System Offline', {
                    description: 'Cannot reach the backend server. Some features may not work.',
                    duration: Infinity,
                });
            }
        };

        // Initial check
        checkHealth();

        // Poll every 60 seconds
        const interval = setInterval(checkHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isHealthy === false) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-pulse">
                    <Activity className="h-3 w-3" />
                    System Offline
                </div>
            </div>
        );
    }

    return null;
}
