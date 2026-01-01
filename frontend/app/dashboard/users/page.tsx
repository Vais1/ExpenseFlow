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
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
                <p className="text-sm text-muted-foreground mt-1">Create and manage user accounts</p>
            </div>

            <Card className="max-w-md shadow-sm">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold">Create Manager Account</CardTitle>
                    <CardDescription className="text-sm mt-1">
                        Create a new Manager account. Managers can approve/reject invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-800 text-sm p-3 rounded-lg font-medium">
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter manager username"
                                disabled={isLoading}
                                className="h-11"
                                {...register('username')}
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive font-medium">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter initial password"
                                disabled={isLoading}
                                className="h-11"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive font-medium">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Manager'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
