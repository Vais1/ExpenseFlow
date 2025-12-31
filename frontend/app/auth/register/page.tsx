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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { authService, UserRole } from '@/services/auth';

const registerSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['Admin', 'Management', 'User']),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        trigger,
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'User',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // Real API registration
            // Note: The backend returns the session (token + user) on successful registration
            const session = await authService.register(data.username, data.password, data.role);

            // Just double check consistency (optional)
            if (session.user.role !== data.role) {
                console.warn("Backend assigned different role than requested");
            }

            router.push('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-sm border-slate-200">
            <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight">Register</CardTitle>
                <CardDescription className="text-xs">
                    Create a new account to get started
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
                            placeholder="Pick a username"
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

                    <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-xs font-medium text-muted-foreground">Role</Label>
                        <Select
                            disabled={isLoading}
                            onValueChange={(value: string) => {
                                setValue('role', value as UserRole);
                                trigger('role');
                            }}
                            value={selectedRole}
                        >
                            <SelectTrigger id="role" className="h-8 w-full text-sm">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Management">Management</SelectItem>
                                <SelectItem value="User">User</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-[10px] text-destructive font-medium">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Button type="submit" className="w-full h-8 text-xs font-medium" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <div className="text-center text-xs text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="underline underline-offset-2 hover:text-primary"
                        >
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
