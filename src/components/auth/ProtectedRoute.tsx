"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login but save the current path to return to after login
            const searchParams = new URLSearchParams();
            if (pathname !== "/" && pathname !== "/login") {
                searchParams.set("callbackUrl", pathname);
            }
            router.push(`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse text-sm">Securing your session...</p>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
