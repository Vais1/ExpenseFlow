'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

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
        } catch (err: any) {
            // Safe error extraction from Axios
            const message = err.response?.data?.message || 'Invalid username or password';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-sm border-slate-200">
            <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight">Login</CardTitle>
                <CardDescription className="text-xs">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-3 pt-2">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                        <Input
                            id="username"
                            placeholder="admin, manager, or user"
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
                <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Button type="submit" className="w-full h-8 text-xs font-medium" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center text-xs text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/auth/register"
                            className="underline underline-offset-2 hover:text-primary"
                        >
                            Register
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
