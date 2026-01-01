'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    invoiceId: number;
    isPending?: boolean;
}

export function RejectDialog({ open, onOpenChange, onConfirm, invoiceId, isPending }: RejectDialogProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
            setReason('');
        }
    };

    const handleClose = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Reject Invoice #{invoiceId}</DialogTitle>
                    <DialogDescription className="text-xs">
                        Please provide a reason for rejecting this invoice. This will be visible to the submitter.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-3">
                    <Label htmlFor="rejection-reason" className="text-xs font-medium">
                        Rejection Reason <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="rejection-reason"
                        placeholder="Enter reason for rejection..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1.5 h-24 text-sm resize-none"
                        maxLength={500}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                        {reason.length}/500
                    </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" size="sm" onClick={handleClose} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isPending}
                        className="h-8 text-xs"
                    >
                        {isPending ? 'Rejecting...' : 'Reject Invoice'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
