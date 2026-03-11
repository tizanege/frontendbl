"use client";

import {
    Users,
    FileText,
    Activity,
    Map as MapIcon,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Zap,
    MapPin,
    ClipboardList,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [backendStats, setBackendStats] = useState({ forms: 0, submissions: 0 });
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isOperative = user?.role === 'field_operative';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const endpoints = isOperative
                    ? ['/dispatch/my-tasks']
                    : ['/forms/stats', '/dispatch/stats'];

                if (isOperative) {
                    const { data } = await api.get('/dispatch/my-tasks');
                    setTasks(data);
                } else {
                    const { data } = await api.get('/forms/stats');
                    setBackendStats(data);
                }
            } catch (err: any) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, isOperative]);

    const stats = [
        { label: "Active Forms", value: backendStats.forms.toString(), change: "+2 this week", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Submissions", value: backendStats.submissions.toLocaleString(), change: "+12.5%", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
        { label: "Field Agents", value: "8", change: "2 active now", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Completion Rate", value: "98.2%", change: "+0.4%", icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {isOperative ? `Welcome back, ${user?.email.split('@')[0]}!` : "System Overview"}
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">
                                {isOperative ? "Here are your assigned field tasks for today." : "Operational intelligence for your field workforce."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">System Live</span>
                            </div>
                            {!isOperative && (
                                <Button className="bg-slate-900 text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-slate-100">
                                    Generate Report
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Operative View: Task Feed */}
                    {isOperative ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
                                <CardHeader className="p-10 border-b border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Active Assignments</CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pt-1">Forms you need to complete in the field.</CardDescription>
                                        </div>
                                        <Badge className="bg-blue-600 text-white border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                                            {tasks.filter(t => t.status !== 'completed').length} Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                        </div>
                                    ) : tasks.length === 0 ? (
                                        <div className="py-24 text-center">
                                            <ClipboardList className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold">No tasks assigned to you.</p>
                                            <p className="text-slate-300 text-sm">Check back later for new deployments.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {tasks.map((task) => (
                                                <div key={task.id} className="p-10 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                                    <div className="flex items-start gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${task.status === 'started' ? 'bg-amber-500 shadow-amber-100 text-white' : 'bg-slate-900 shadow-slate-100 text-white'}`}>
                                                            <FileText className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.form?.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                                                    <span className="text-xs text-slate-500 font-bold">{task.location_name || "Assigned Area"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                                    <span className="text-xs text-slate-500 font-bold">
                                                                        {task.scheduled_at ? new Date(task.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ASAP"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link href={`/forms/${task.form_id}/submit?dispatchId=${task.id}`}>
                                                        <Button className={`rounded-2xl h-14 px-8 font-black shadow-xl transition-all flex items-center gap-2 ${task.status === 'started' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}>
                                                            {task.status === 'started' ? 'Continue' : 'Start Task'}
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-[40px] bg-slate-900 text-white overflow-hidden flex flex-col justify-between">
                                <CardHeader className="p-10">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                                        <Zap className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <Badge className="bg-white/10 text-white border-none font-bold text-[10px] tracking-widest mb-4">FIELD AGENT HUD</Badge>
                                    <CardTitle className="text-3xl font-black tracking-tight leading-tight">Sync Status & Connectivity</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium text-lg mt-2">Your data is being synced to the cloud in real-time.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sync Pipeline</span>
                                            <span className="text-xs font-black text-green-400">STABLE</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full animate-pulse" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">All local entries successfully pushed.</p>
                                    </div>
                                    <div className="p-6 bg-blue-600 rounded-3xl space-y-2 text-center shadow-2xl shadow-blue-900/50">
                                        <p className="text-xs font-black italic">BLESH OFFLINE ENGINE</p>
                                        <p className="text-[10px] font-medium opacity-80">Syncing 12 queued geotags...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        /* Admin View: System Stats */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, i) => (
                                    <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                                </div>
                                                <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 rounded-lg px-2 py-0.5">Live</Badge>
                                            </div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                            <div className="mt-4 flex items-center gap-2">
                                                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                                <span className="text-xs font-bold text-green-600">{stat.change}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
                                    <CardHeader className="p-10 pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</CardTitle>
                                            <CardDescription className="text-slate-400 font-medium">Real-time feed from operatives in the field.</CardDescription>
                                        </div>
                                        <Button variant="ghost" className="text-blue-600 font-black text-sm hover:bg-blue-50">View All</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-50">
                                            {[
                                                { user: "Michael Chen", action: "submitted", form: "Safety Audit #42", time: "2 mins ago", status: "complete" },
                                                { user: "Sarah Jenkins", action: "started", form: "Inventory Count", time: "15 mins ago", status: "pending" },
                                                { user: "David Miller", action: "flagged", form: "Equipment Check", time: "45 mins ago", status: "alert" },
                                                { user: "Michael Chen", action: "submitted", form: "Safety Audit #41", time: "1 hour ago", status: "complete" },
                                            ].map((activity, i) => (
                                                <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">
                                                            {activity.user.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm">
                                                                <span className="font-black text-slate-900">{activity.user}</span>
                                                                <span className="text-slate-400 mx-2">{activity.action}</span>
                                                                <span className="font-bold text-blue-600">{activity.form}</span>
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock className="w-3 h-3 text-slate-300" />
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activity.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {activity.status === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                    {activity.status === 'pending' && <Clock className="w-5 h-5 text-blue-400 animate-pulse" />}
                                                    {activity.status === 'alert' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm rounded-[40px] bg-slate-900 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-10">
                                        <div className="w-12 h-12 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <MapIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <CardHeader className="p-10 h-1/2 flex flex-col justify-end">
                                        <Badge className="w-fit mb-4 bg-blue-500/20 text-blue-400 border-none font-black text-[10px] tracking-[0.2em] px-3 py-1">GEOSPATIAL INSIGHTS</Badge>
                                        <CardTitle className="text-3xl font-black tracking-tight leading-tight">Field Coverage Analytics</CardTitle>
                                        <CardDescription className="text-slate-400 font-medium text-lg mt-2">
                                            Your team has covered 12.4km² in the last 24 hours.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-10 h-1/2 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                                    <span>Regional Targets</span>
                                                    <span className="text-white font-black">84%</span>
                                                </div>
                                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-blue-500 h-full w-[84%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 font-black text-sm flex items-center justify-center gap-2 group">
                                            Open Territory Map <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
