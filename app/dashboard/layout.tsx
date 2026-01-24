import SideNav from "./_components/SideNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white">
            <div className="md:w-64 md:fixed z-10">
                <SideNav />
            </div>
            <div className="md:ml-64">{children}</div>
        </div>
    );
}
