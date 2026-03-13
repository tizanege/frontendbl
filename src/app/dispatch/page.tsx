"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Zap, Plus, Search, Filter, Calendar as CalendarIcon,
    MapPin, Clock, User as UserIcon, MoreVertical,
    CheckCircle2, AlertCircle, Loader2, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-slate-500", bg: "bg-slate-50" },
    assigned: { label: "Assigned", color: "text-blue-600", bg: "bg-blue-50" },
    started: { label: "In Progress", color: "text-amber-600", bg: "bg-amber-50" },
    completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50" },
    cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50" },
};

import { Suspense } from "react";

function DispatchPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const formIdParam = searchParams.get('formId');
    const [dispatches, setDispatches] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [forms, setForms] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newDispatch, setNewDispatch] = useState({
        form_id: "",
        assigned_to_id: "",
        scheduled_at: "",
        location_name: "",
        notes: "",
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            const [dispRes, statsRes, formsRes, membersRes] = await Promise.all([
                api.get("/dispatch"),
                api.get("/dispatch/stats"),
                api.get("/forms"),
                api.get("/team"),
            ]);
            setDispatches(dispRes.data);
            setStats(statsRes.data);
            setForms(formsRes.data);
            setMembers(membersRes.data.filter((m: any) => m.role === 'field_operative' || m.role === 'member'));
        } catch (err) {
            console.error("Failed to load dispatch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (formIdParam && forms.length > 0) {
            setNewDispatch(prev => ({ ...prev, form_id: formIdParam }));
            setDispatchOpen(true);
        }
    }, [formIdParam, forms]);

    const handleCreateDispatch = async () => {
        setCreating(true);
        try {
            await api.post("/dispatch", newDispatch);
            setDispatchOpen(false);
            setNewDispatch({ form_id: "", assigned_to_id: "", scheduled_at: "", location_name: "", notes: "" });
            fetchData();
        } catch (err) {
            alert("Failed to create dispatch.");
        } finally {
            setCreating(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/dispatch/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Zap className="w-5 h-5 text-white fill-white" />
                                </div>
                                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                                    Workforce Dispatching
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Operation Command</h1>
                            <p className="text-slate-500 font-medium mt-1">Assign field work, track progress, and manage task lifecycles.</p>
                        </div>

                        <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-8 font-black shadow-xl flex items-center gap-2">
                                    <Plus className="w-5 h-5" /> New Work Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[40px] border-none shadow-2xl max-w-lg p-0 overflow-hidden">
                                <div className="bg-blue-600 p-10 pb-8">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                                        <Zap className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black text-white tracking-tight">Create Work Order</DialogTitle>
                                    <DialogDescription className="text-blue-100 font-medium mt-1">
                                        Deploy a field task to your team. Pre-fill data or set locations.
                                    </DialogDescription>
                                </div>
                                <div className="p-10 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Select Form</Label>
                                            <Select value={newDispatch.form_id} onValueChange={v => setNewDispatch({ ...newDispatch, form_id: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                                                    <SelectValue placeholder="Choose form..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                                    {forms.map(f => (
                                                        <SelectItem key={f.id} value={f.id} className="rounded-xl font-bold">{f.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Assign Member</Label>
                                            <Select value={newDispatch.assigned_to_id} onValueChange={v => setNewDispatch({ ...newDispatch, assigned_to_id: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold">
                                                    <SelectValue placeholder="Select operative..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                                    {members.map(m => (
                                                        <SelectItem key={m.id} value={m.id} className="rounded-xl font-bold">{m.first_name} {m.last_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Scheduled Date</Label>
                                        <Input
                                            type="datetime-local"
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                                            value={newDispatch.scheduled_at}
                                            onChange={e => setNewDispatch({ ...newDispatch, scheduled_at: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Deployment Location</Label>
                                        <Input
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-medium"
                                            placeholder="e.g. Site B - Warehouse"
                                            value={newDispatch.location_name}
                                            onChange={e => setNewDispatch({ ...newDispatch, location_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Dispatch Notes</Label>
                                        <Input
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-medium"
                                            placeholder="Special instructions..."
                                            value={newDispatch.notes}
                                            onChange={e => setNewDispatch({ ...newDispatch, notes: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCreateDispatch}
                                        disabled={creating || !newDispatch.form_id || !newDispatch.assigned_to_id}
                                        className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-lg shadow-blue-100 mt-2"
                                    >
                                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Dispatch"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { label: "Total Tasks", value: stats.total ?? 0, icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100" },
                            { label: "Waiting", value: stats.pending ?? 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Active Now", value: stats.in_progress ?? 0, icon: ActivityIcon, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "Completed", value: stats.completed ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                        ].map((s, i) => (
                            <Card key={i} className="border-none shadow-sm rounded-[28px]">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                        <s.icon className={`w-6 h-6 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                        <p className="text-3xl font-black text-slate-900">{s.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content */}
                    <Card className="border-none shadow-sm rounded-[40px] overflow-hidden">
                        <CardHeader className="p-10 pb-0 border-b border-slate-50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Work Orders</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">Currently active field deployments</CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50/50" placeholder="Search orders..." />
                                    </div>
                                    <Button variant="outline" className="h-11 rounded-xl border-slate-100 gap-2 font-bold bg-white">
                                        <Filter className="w-4 h-4" /> Filter
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Work Order</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Assignee</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Schedule</th>
                                        <th className="px-10 py-5 text-right" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dispatches.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold">No dispatch orders found.</p>
                                                <p className="text-slate-300 text-sm">Deploy your first task to see it here.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        dispatches.map((d) => (
                                            <tr key={d.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                                            <ClipboardList className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{d.form?.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <MapPin className="w-3 h-3 text-slate-300" />
                                                                <span className="text-xs text-slate-400 font-bold">{d.location_name || "Any Location"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                                                            {d.assigned_to?.first_name[0]}{d.assigned_to?.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{d.assigned_to?.first_name} {d.assigned_to?.last_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{d.assigned_to?.role?.replace('_', ' ')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit ${STATUS_CONFIG[d.status]?.bg || 'bg-slate-50'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[d.status]?.color?.replace('text-', 'bg-') || 'bg-slate-400'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[d.status]?.color || 'text-slate-500'}`}>
                                                            {STATUS_CONFIG[d.status]?.label || d.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
                                                            {d.scheduled_at ? new Date(d.scheduled_at).toLocaleDateString() : "Instant"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {d.scheduled_at ? new Date(d.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[180px]">
                                                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => updateStatus(d.id, "started")}>
                                                                Mark In Progress
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => updateStatus(d.id, "completed")}>
                                                                Mark Completed
                                                            </DropdownMenuItem>
                                                            <div className="h-px bg-slate-100 my-1" />
                                                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer text-red-500" onClick={() => updateStatus(d.id, "cancelled")}>
                                                                Cancel Dispatch
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        )
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}

export default function DispatchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Strategy Center...</p>
                </div>
            </div>
        }>
            <DispatchPageContent />
        </Suspense>
    );
}
