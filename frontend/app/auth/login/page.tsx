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

export default function LoginPage() {
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
            await authService.login(data.username, data.password);
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid username or password';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg border-slate-200/80 rounded-xl">
            <CardHeader className="space-y-2 px-8 pt-8 pb-4">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/logo.svg"
                        alt="VendorPay Logo"
                        width={56}
                        height={56}
                        priority
                    />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight text-center">Welcome Back</CardTitle>
                <CardDescription className="text-sm text-center text-muted-foreground">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5 px-8">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter your username"
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
                            placeholder="Enter your password"
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
                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-8 pt-6 pb-8">
                    <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/auth/register"
                            className="font-medium text-primary hover:underline underline-offset-2"
                        >
                            Register
                        </Link>
                    </div>

                </CardFooter>
            </form>
        </Card>
    );
}
