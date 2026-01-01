'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <div className="rounded border bg-card/50">
            <Table>
                <TableHeader>
                    <TableRow className="h-9 hover:bg-transparent">
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i} className="h-9">
                                <Skeleton className="h-3 w-16" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex} className="h-10">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton className="h-3 w-full max-w-[100px]" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
