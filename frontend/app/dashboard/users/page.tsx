'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';

const createManagerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateManagerValues = z.infer<typeof createManagerSchema>;

export default function UsersPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateManagerValues>({
        resolver: zodResolver(createManagerSchema),
    });

    useEffect(() => {
        const checkRole = () => {
            const session = authService.getSession();
            if (!session || session.user.role !== 'Admin') {
                // Not an admin - redirect to dashboard
                router.push('/dashboard');
            } else {
                setIsAdmin(true);
            }
            setCheckingRole(false);
        };
        checkRole();
    }, [router]);

    const onSubmit = async (data: CreateManagerValues) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await authService.createManager(data.username, data.password);

            if (result.success) {
                setSuccess(`Manager account "${data.username}" created successfully!`);
                reset();
            } else {
                setError(result.message || 'Failed to create manager account');
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403) {
                setError('Access denied. Only Admins can create Manager accounts.');
            } else {
                const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create manager account';
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingRole) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Checking permissions...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Redirect happens in useEffect
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">User Management</h1>
                <p className="text-sm text-muted-foreground">Admin-only: Create and manage user accounts</p>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="text-base">Create Manager Account</CardTitle>
                    <CardDescription className="text-xs">
                        Create a new Manager account. Managers can approve/reject invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-sm font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-800 text-xs p-2 rounded-sm font-medium">
                                {success}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter manager username"
                                disabled={isLoading}
                                className="h-8 text-sm"
                                {...register('username')}
                            />
                            {errors.username && (
                                <p className="text-[10px] text-destructive font-medium">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter initial password"
                                disabled={isLoading}
                                className="h-8 text-sm"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-[10px] text-destructive font-medium">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full h-8 text-xs font-medium" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Manager'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
