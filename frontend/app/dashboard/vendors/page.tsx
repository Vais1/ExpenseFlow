'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2, Power, PowerOff } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/use-vendors';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { VendorStatus } from '@/lib/types';

interface VendorFormData {
    name: string;
    category: string;
    status?: VendorStatus;
}

export default function VendorManagementPage() {
    const router = useRouter();
    const { data: vendors, isLoading, error } = useVendors();
    const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
    const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
    const { mutate: deleteVendor, isPending: isDeleting } = useDeleteVendor();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<{ id: number; name: string; category: string; status: VendorStatus } | null>(null);
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
    const [formData, setFormData] = useState<VendorFormData>({ name: '', category: '' });

    useEffect(() => {
        const session = authService.getSession();
        if (!session || session.user.role !== 'Admin') {
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const filteredVendors = vendors?.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

    const handleAddClick = () => {
        setEditingVendor(null);
        setFormData({ name: '', category: '' });
        setFormDialogOpen(true);
    };

    const handleEditClick = (vendor: { id: number; name: string; category: string; status: VendorStatus }) => {
        setEditingVendor(vendor);
        setFormData({ name: vendor.name, category: vendor.category, status: vendor.status });
        setFormDialogOpen(true);
    };

    const handleFormSubmit = () => {
        if (!formData.name.trim() || !formData.category.trim()) return;

        if (editingVendor) {
            updateVendor({
                id: editingVendor.id,
                payload: {
                    name: formData.name.trim(),
                    category: formData.category.trim(),
                    status: formData.status,
                },
            });
        } else {
            createVendor({
                name: formData.name.trim(),
                category: formData.category.trim(),
            });
        }
        setFormDialogOpen(false);
        setEditingVendor(null);
        setFormData({ name: '', category: '' });
    };

    const handleToggleStatus = (vendor: { id: number; name: string; category: string; status: VendorStatus }) => {
        const newStatus: VendorStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
        updateVendor({
            id: vendor.id,
            payload: {
                name: vendor.name,
                category: vendor.category,
                status: newStatus,
            },
        });
    };

    const handleDeleteClick = (id: number) => {
        setSelectedVendorId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedVendorId) {
            deleteVendor(selectedVendorId);
            setDeleteDialogOpen(false);
            setSelectedVendorId(null);
        }
    };

    if (!isAuthorized) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">Vendors</h1>
                </div>
                <Button size="sm" className="gap-2 h-8 text-xs font-medium" onClick={handleAddClick} disabled={isCreating}>
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

            {isLoading ? (
                <TableSkeleton columns={5} rows={5} />
            ) : error ? (
                <div className="flex h-64 items-center justify-center text-destructive text-sm">
                    Failed to load vendors. Please try again.
                </div>
            ) : (
                <div className="rounded border bg-card/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="h-9 hover:bg-transparent">
                                <TableHead className="w-[80px] h-9 text-xs font-semibold">ID</TableHead>
                                <TableHead className="h-9 text-xs font-semibold">Vendor Name</TableHead>
                                <TableHead className="h-9 text-xs font-semibold">Category</TableHead>
                                <TableHead className="h-9 text-xs font-semibold">Status</TableHead>
                                <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVendors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                                        {searchQuery ? 'No vendors match your search.' : 'No vendors yet. Add your first vendor.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <TableRow key={vendor.id} className="h-10">
                                        <TableCell className="font-medium text-xs dark:text-gray-300">#{vendor.id}</TableCell>
                                        <TableCell className="text-xs text-foreground font-medium">{vendor.name}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{vendor.category}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    vendor.status === 'Active'
                                                        ? 'h-5 bg-green-50 text-green-700 border-green-200 px-2 text-[10px] uppercase tracking-wide font-semibold'
                                                        : 'h-5 bg-gray-100 text-gray-500 border-gray-200 px-2 text-[10px] uppercase tracking-wide font-semibold'
                                                }
                                            >
                                                {vendor.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-7 w-7 ${vendor.status === 'Active' ? 'text-muted-foreground/70 hover:text-orange-600 hover:bg-orange-50' : 'text-muted-foreground/70 hover:text-green-600 hover:bg-green-50'}`}
                                                    onClick={() => handleToggleStatus(vendor)}
                                                    disabled={isUpdating}
                                                    title={vendor.status === 'Active' ? 'Deactivate vendor' : 'Activate vendor'}
                                                >
                                                    {vendor.status === 'Active' ? (
                                                        <PowerOff className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Power className="h-3.5 w-3.5" />
                                                    )}
                                                    <span className="sr-only">{vendor.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground/70 hover:text-primary hover:bg-primary/10"
                                                    onClick={() => handleEditClick(vendor)}
                                                    disabled={isUpdating}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteClick(vendor.id)}
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
            )}

            {/* Add/Edit Vendor Dialog */}
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {editingVendor ? 'Update the vendor details below.' : 'Enter the vendor details below.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-3">
                        <div>
                            <Label htmlFor="vendor-name" className="text-xs font-medium">
                                Vendor Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="vendor-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter vendor name"
                                className="mt-1.5 h-9 text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="vendor-category" className="text-xs font-medium">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="vendor-category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g., Office Supplies, IT Services"
                                className="mt-1.5 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" size="sm" onClick={() => setFormDialogOpen(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleFormSubmit}
                            disabled={!formData.name.trim() || !formData.category.trim() || isCreating || isUpdating}
                            className="h-8 text-xs"
                        >
                            {editingVendor ? (isUpdating ? 'Saving...' : 'Save Changes') : (isCreating ? 'Adding...' : 'Add Vendor')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Vendor"
                description="Are you sure you want to delete this vendor? The vendor will be removed from the active list."
                isPending={isDeleting}
            />
        </div>
    );
}
