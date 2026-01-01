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

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterValues) => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.register(data.username, data.password);
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
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
                <CardTitle className="text-xl font-semibold tracking-tight text-center">Create Account</CardTitle>
                <CardDescription className="text-sm text-center text-muted-foreground">
                    Register for a new user account
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
                            placeholder="Choose a username"
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
                            placeholder="Create a password"
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

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            disabled={isLoading}
                            className="h-11"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-destructive font-medium">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-8 pt-6 pb-8">
                    <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="font-medium text-primary hover:underline underline-offset-2"
                        >
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
