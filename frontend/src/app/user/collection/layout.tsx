export default function layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex grow w-full max-w-300 flex-col">
            {children}
        </div>
    )
}