"use client";

import { useState, useEffect } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, TrendingDown, FileText, Activity, MapPin,
    Calendar, ArrowUpRight, BarChart2, Loader2, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const COLORS = ["#2563eb", "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="font-black text-slate-900 text-lg">
                        {p.value} <span className="text-slate-400 font-medium text-xs lowercase">{p.name}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;
            try {
                const { data } = await api.get("/forms/analytics");
                setAnalytics(data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setStatsLoading(false);
            }
        };
        if (user) {
            fetch();
        }
    }, [user]);

    const { totals, dailyData, formBreakdown } = analytics || { totals: {}, dailyData: [], formBreakdown: [] };
    const isPositiveMoM = (totals.momChange ?? 0) >= 0;

    const kpis = [
        {
            label: "Total Submissions",
            value: totals.submissions?.toLocaleString() ?? "0",
            sub: `${totals.submissionsThisMonth ?? 0} this month`,
            icon: Activity,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
            trend: isPositiveMoM,
            change: `${totals.momChange > 0 ? '+' : ''}${totals.momChange}% MoM`,
        },
        {
            label: "Active Forms",
            value: totals.forms?.toString() ?? "0",
            sub: "Deployed workflows",
            icon: FileText,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50",
            trend: true,
            change: "+2 this week",
        },
        {
            label: "Geo-Tagged Captures",
            value: totals.geoTagged?.toLocaleString() ?? "0",
            sub: `${totals.geoRate ?? 0}% of all submissions`,
            icon: MapPin,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
            trend: true,
            change: `${totals.geoRate ?? 0}% rate`,
        },
        {
            label: "This Month",
            value: totals.submissionsThisMonth?.toLocaleString() ?? "0",
            sub: `vs ${totals.submissionsLastMonth ?? 0} last month`,
            icon: Calendar,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-50",
            trend: isPositiveMoM,
            change: `${totals.momChange > 0 ? '+' : ''}${totals.momChange}%`,
        },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-8">
                {statsLoading ? (
                    <div className="h-screen flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <BarChart2 className="w-5 h-5 text-white" />
                                    </div>
                                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                                        Live Intelligence
                                    </Badge>
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics Command</h1>
                                <p className="text-slate-500 font-medium mt-1">Operational data insights from your field workforce.</p>
                            </div>
                            <Button className="bg-slate-900 text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-slate-200 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Generate Report
                            </Button>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {kpis.map((kpi, i) => (
                                <Card key={i} className="border-none shadow-sm rounded-[32px] group hover:shadow-xl transition-all duration-500 overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`w-14 h-14 ${kpi.iconBg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                                <kpi.icon className={`w-7 h-7 ${kpi.iconColor}`} />
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${kpi.trend ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                {kpi.trend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {kpi.change}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{kpi.value}</p>
                                        <p className="text-xs text-slate-400 font-medium">{kpi.sub}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Main Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] overflow-hidden">
                                <CardHeader className="p-10 pb-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Submission Velocity</CardTitle>
                                            <CardDescription className="text-slate-400 font-medium">Daily capture rate — last 30 days</CardDescription>
                                        </div>
                                        <Badge className="bg-blue-600 text-white border-none text-[10px] font-black tracking-widest px-3 py-1.5">
                                            LIVE
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-8">
                                    {dailyData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={dailyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', letterSpacing: 1 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(v) => {
                                                        const d = new Date(v);
                                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                                    }}
                                                    interval={4}
                                                />
                                                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="submissions"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                    fill="url(#submissionsGradient)"
                                                    dot={false}
                                                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center">
                                            <div className="text-center">
                                                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-400 font-bold">No submission data yet.</p>
                                                <p className="text-slate-300 text-sm">Submit your first form to see live trends.</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-slate-900 text-white">
                                <CardHeader className="p-10 pb-4">
                                    <CardTitle className="text-xl font-black tracking-tight">Form Performance</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">Submission share by workflow</CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    {formBreakdown.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <PieChart>
                                                    <Pie
                                                        data={formBreakdown}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={75}
                                                        dataKey="submissions"
                                                        strokeWidth={0}
                                                    >
                                                        {formBreakdown.map((_: any, index: number) => (
                                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '16px', border: 'none',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            backdropFilter: 'blur(12px)',
                                                            color: '#fff',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-3 mt-4">
                                                {formBreakdown.slice(0, 4).map((f: any, i: number) => (
                                                    <div key={f.formId} className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                                            <span className="text-xs font-bold text-slate-300 truncate">{f.formName}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-white flex-shrink-0">{f.submissions}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-[220px] flex items-center justify-center">
                                            <div className="text-center opacity-40">
                                                <BarChart2 className="w-10 h-10 mx-auto mb-3" />
                                                <p className="font-bold text-sm">No data yet</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
