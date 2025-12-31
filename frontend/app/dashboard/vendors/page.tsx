'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/use-vendors';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function VendorManagementPage() {
    const router = useRouter();
    const { data: vendors, isLoading, error } = useVendors();
    const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
    const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
    const { mutate: deleteVendor, isPending: isDeleting } = useDeleteVendor();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const session = authService.getSession();
        if (!session || session.user.role !== 'Admin') {
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const filteredVendors = vendors?.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleAdd = () => {
        const name = window.prompt('Enter vendor name:');
        const category = window.prompt('Enter vendor category:', 'General');
        if (name && category) {
            createVendor({ name, category });
        }
    };

    const handleEdit = (id: number, currentName: string, currentCategory: string) => {
        const newName = window.prompt('Update vendor name:', currentName);
        const newCategory = window.prompt('Update vendor category:', currentCategory);
        if (newName && newCategory) {
            updateVendor({ id, payload: { name: newName, category: newCategory } });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            deleteVendor(id);
        }
    };

    if (!isAuthorized) return null;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center text-destructive text-sm">
                Failed to load vendors. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">Vendor Management</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage system vendors and suppliers.
                    </p>
                </div>
                <Button size="sm" className="gap-2 h-8 text-xs font-medium" onClick={handleAdd} disabled={isCreating}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Vendor
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs"
                    />
                </div>
            </div>

            <div className="rounded border bg-card/50">
                <Table>
                    <TableHeader>
                        <TableRow className="h-9 hover:bg-transparent">
                            <TableHead className="w-[100px] h-9 text-xs font-semibold">ID</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Vendor Name</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Category</TableHead>
                            <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                                    No vendors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVendors.map((vendor) => (
                                <TableRow key={vendor.id} className="h-10">
                                    <TableCell className="font-medium text-xs dark:text-gray-300">#{vendor.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{vendor.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{vendor.category}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/70 hover:text-primary hover:bg-primary/10"
                                                onClick={() => handleEdit(vendor.id, vendor.name, vendor.category)}
                                                disabled={isUpdating}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(vendor.id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
