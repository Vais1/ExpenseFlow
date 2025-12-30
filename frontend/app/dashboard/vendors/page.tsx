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

interface Vendor {
    id: string;
    name: string;
}

const INITIAL_VENDORS: Vendor[] = [
    { id: 'V-001', name: 'Dell' },
    { id: 'V-002', name: 'Staples' },
    { id: 'V-003', name: 'Tenaga Nasional' },
    { id: 'V-004', name: 'Microsoft' },
    { id: 'V-005', name: 'Amazon Web Services' },
];

export default function VendorManagementPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = authService.getSession();
        if (!session || session.user.role !== 'Admin') {
            router.push('/dashboard');
            return;
        }
        setLoading(false);
    }, [router]);

    const filteredVendors = vendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        const name = window.prompt('Enter vendor name:');
        if (name) {
            const newVendor: Vendor = {
                id: `V-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
                name,
            };
            setVendors([...vendors, newVendor]);
        }
    };

    const handleEdit = (id: string, currentName: string) => {
        const newName = window.prompt('Update vendor name:', currentName);
        if (newName && newName !== currentName) {
            setVendors(
                vendors.map((v) => (v.id === id ? { ...v, name: newName } : v))
            );
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            setVendors(vendors.filter((v) => v.id !== id));
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">Vendor Management</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage system vendors and suppliers.
                    </p>
                </div>
                <Button size="sm" className="gap-2 h-8 text-xs font-medium" onClick={handleAdd}>
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
                            <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                                    No vendors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVendors.map((vendor) => (
                                <TableRow key={vendor.id} className="h-10">
                                    <TableCell className="font-medium text-xs">{vendor.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{vendor.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/70 hover:text-primary hover:bg-primary/10"
                                                onClick={() => handleEdit(vendor.id, vendor.name)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(vendor.id)}
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
