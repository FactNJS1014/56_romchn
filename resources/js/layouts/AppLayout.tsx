import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-slate-50">

            {/* ── Navbar (top, full width) ── */}
            <Navbar
                onMenuToggle={() => setSidebarOpen((v) => !v)}
                sidebarOpen={sidebarOpen}
            />

            {/* ── Body (sidebar + main) ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                        {/* Page header */}
                        {(title || subtitle) && (
                            <div className="mb-6">
                                {title && (
                                    <h1 className="text-lg font-semibold text-slate-800">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
                                )}
                            </div>
                        )}

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}