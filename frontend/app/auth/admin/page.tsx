'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const session = await authService.login(data.username, data.password);

            // Validate role - only Admin and Management allowed here
            if (session.user.role === 'User') {
                setError('This login is for Admin and Manager accounts only. Please use the User login.');
                authService.logout();
                return;
            }

            // Role-based redirect
            if (session.user.role === 'Admin') {
                router.push('/dashboard/overview');
            } else if (session.user.role === 'Management') {
                router.push('/dashboard/approvals');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid username or password';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-sm border-slate-200">
            <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/logo.svg"
                        alt="VendorPay Logo"
                        width={48}
                        height={48}
                        priority
                    />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight text-center">Admin / Manager Login</CardTitle>
                <CardDescription className="text-xs text-center">
                    Internal access only - login with your Admin or Manager credentials
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter your admin username"
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
                            placeholder="Enter your password"
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-4 pb-6">
                    <Button type="submit" className="w-full h-8 text-xs font-medium" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center text-xs text-muted-foreground pt-2 border-t border-slate-100 w-full mt-2">
                        <Link
                            href="/auth/login"
                            className="text-muted-foreground/70 hover:text-primary"
                        >
                            ← Back to User Login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
