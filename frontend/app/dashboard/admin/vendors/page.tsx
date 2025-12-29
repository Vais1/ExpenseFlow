"use client";

import { useMemo, useState } from "react";
import { useVendorsList, useDeleteVendor } from "@/hooks/use-vendors";
import type { Vendor } from "@/types/api";

// Components
import { VendorDialog } from "@/components/vendor-dialog";

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Icons
import {
    Plus,
    Search,
    RefreshCw,
    XCircle,
    Pencil,
    Trash2,
    Building2,
    Loader2,
} from "lucide-react";

export default function VendorManagementPage() {
    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

    // Data fetching
    const {
        data: vendors,
        isLoading: vendorsLoading,
        isError: vendorsError,
        refetch: refetchVendors,
    } = useVendorsList();

    const deleteMutation = useDeleteVendor();

    // Filter vendors based on search
    const filteredVendors = useMemo(() => {
        if (!vendors) return [];
        if (!searchQuery.trim()) return vendors;

        const query = searchQuery.toLowerCase();
        return vendors.filter(
            (vendor) =>
                vendor.name.toLowerCase().includes(query) ||
                (vendor.category && vendor.category.toLowerCase().includes(query))
        );
    }, [vendors, searchQuery]);

    // Handle create
    const handleCreate = () => {
        setEditingVendor(null);
        setDialogOpen(true);
    };

    // Handle edit
    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (vendor: Vendor) => {
        setVendorToDelete(vendor);
        setDeleteDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = () => {
        if (!vendorToDelete) return;

        deleteMutation.mutate(vendorToDelete.id, {
            onSuccess: () => {
                toast.success("Vendor deleted successfully");
                setDeleteDialogOpen(false);
                setVendorToDelete(null);
            },
            onError: (error) => {
                const message =
                    error instanceof Error && error.message.includes("400")
                        ? "Cannot delete: This vendor has associated invoices."
                        : error instanceof Error
                            ? error.message
                            : "Failed to delete vendor";
                toast.error(message);
                setDeleteDialogOpen(false);
                setVendorToDelete(null);
            },
        });
    };

    // Handle dialog success
    const handleDialogSuccess = () => {
        toast.success(editingVendor ? "Vendor updated successfully" : "Vendor created successfully");
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Vendor Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Add, edit, and manage system vendors
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Vendor
                </Button>
            </div>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Vendors
                        </CardTitle>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {vendorsLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{vendors?.length || 0}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <CardTitle>Vendors</CardTitle>
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchVendors()}
                        disabled={vendorsLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${vendorsLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Loading State */}
                    {vendorsLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {vendorsError && (
                        <div className="text-center py-12">
                            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">Failed to load data</h3>
                            <p className="text-muted-foreground mb-4">
                                There was an error fetching vendors.
                            </p>
                            <Button onClick={() => refetchVendors()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!vendorsLoading && !vendorsError && filteredVendors.length === 0 && (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {searchQuery ? "No vendors found" : "No vendors yet"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Create your first vendor to get started."}
                            </p>
                            {!searchQuery && (
                                <Button onClick={handleCreate}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Vendor
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Table */}
                    {!vendorsLoading && !vendorsError && filteredVendors.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVendors.map((vendor) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell className="font-medium">{vendor.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {vendor.category || "—"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {vendor.email || "—"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {vendor.phone || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(vendor)}
                                                        title="Edit vendor"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDeleteClick(vendor)}
                                                        title="Delete vendor"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <VendorDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                vendor={editingVendor}
                onSuccess={handleDialogSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the vendor &quot;{vendorToDelete?.name}&quot;.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
