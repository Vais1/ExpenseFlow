export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-[350px]">
                {children}
            </div>
        </div>
    );
}
