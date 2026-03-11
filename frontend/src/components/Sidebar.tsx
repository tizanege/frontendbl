"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Settings,
    CreditCard,
    Users,
    LogOut,
    ShieldCheck,
    Zap,
    ChevronRight,
    BarChart2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Form Studio", icon: FileText, path: "/forms" },
    { name: "Work Dispatch", icon: Zap, path: "/dispatch" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
    { name: "Team & Access", icon: Users, path: "/team" },
    { name: "Billing", icon: CreditCard, path: "/settings/billing" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    // Hide sidebar on landing, auth pages, public forms, or if not logged in
    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname.includes("/submit");
    if (isPublicPage || !user) return null;

    return (
        <div className="w-80 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 shrink-0">
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight italic">BLESH<span className="text-blue-600 NOT-italic">FORMS</span></span>
            </div>

            <div className="px-6 mb-8 mt-2">
                <div className="bg-slate-900 rounded-[24px] p-6 text-white relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Active Workspace</p>
                    <p className="font-bold text-sm mb-4 truncate">Acme Field Ops</p>
                    <div className="flex items-center justify-between">
                        <Badge className="bg-white/20 text-white border-none py-0.5 px-3 font-bold text-[9px] uppercase tracking-widest">PRO PLAN</Badge>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </div>
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-1">
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
                    return (
                        <Link key={item.path} href={item.path}>
                            <div className={`
                flex items-center gap-4 px-4 h-14 rounded-2xl transition-all duration-200 group
                ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}>
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`} />
                                <span className="font-bold text-sm">{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-[24px] p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
                        <p className="font-black text-slate-900 text-xs">Upgrade to Business</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">Unlock Geo-analytics and 24/7 priority support.</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-[11px] font-black shadow-lg shadow-blue-100 uppercase tracking-wider">
                        Learn More
                    </Button>
                </div>

                <div className="h-px bg-slate-50" />

                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-600 text-xs">
                        {user?.email?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate uppercase mt-1">{user?.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate">Field Admin</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
