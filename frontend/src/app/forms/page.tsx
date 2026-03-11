"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, MoreVertical, Search, Filter, ArrowUpRight, Clock, MapPin, Activity, Loader2, Share2, Settings2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FormsListPage() {
    const { user } = useAuth();
    const [forms, setForms] = useState<any[]>([]);
    const [backendStats, setBackendStats] = useState({ forms: 0, submissions: 0, geoTagged: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForms = async () => {
            if (!user) return;
            try {
                const [formsRes, statsRes] = await Promise.all([
                    api.get("/forms"),
                    api.get("/forms/stats")
                ]);
                setForms(formsRes.data);
                setBackendStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch forms", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchForms();
        }
    }, [user]);

    const copyShareLink = (formId: string) => {
        const url = `${window.location.origin}/forms/${formId}/submit`;
        navigator.clipboard.writeText(url);
        alert("Public link copied to clipboard!");
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F9FAFB] p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Form Studio</h1>
                            <p className="text-slate-500 font-medium mt-1">Design and manage your field data capture workflows.</p>
                        </div>
                        <Link href="/forms/new">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-8 font-bold shadow-xl shadow-blue-100 transition-all flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Create New Form
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { label: "Total Forms", value: forms.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Active Submissions", value: backendStats.submissions.toLocaleString(), icon: Clock, color: "text-green-600", bg: "bg-green-50" },
                            { label: "Geo-tagged Entries", value: backendStats.geoTagged || 0, icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm rounded-3xl">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input className="pl-12 h-12 rounded-2xl border-none shadow-sm bg-white font-medium" placeholder="Search forms..." />
                        </div>
                        <Button variant="outline" className="h-12 rounded-2xl px-6 border-slate-100 bg-white font-bold flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filter
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {forms.map((form) => (
                                <Card key={form.id} className="border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-50">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2">
                                                    <DropdownMenuItem className="rounded-xl font-bold cursor-pointer" onClick={() => copyShareLink(form.id)}>
                                                        <Share2 className="w-4 h-4 mr-2" /> Share Public Link
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="p-0 rounded-xl overflow-hidden">
                                                        <Link href={`/forms/${form.id}/edit`} className="flex items-center w-full px-2 py-1.5 font-bold hover:bg-slate-50 transition-colors">
                                                            <Settings2 className="w-4 h-4 mr-2" /> Edit Workflow
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl font-bold cursor-pointer">
                                                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl font-bold cursor-pointer text-red-500">Archive Form</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Link href={`/forms/${form.id}`}>
                                            <CardTitle className="text-xl font-black text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-1">{form.name}</CardTitle>
                                        </Link>
                                        <CardDescription className="line-clamp-2 mt-2 font-medium min-h-[40px] text-slate-400">{form.description}</CardDescription>
                                    </CardHeader>
                                    <Separator className="bg-slate-50 mx-8" />
                                    <CardContent className="p-8 pt-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    {form.submissionsCount || 0}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submissions</span>
                                            </div>
                                            {form.status === 'published' ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] tracking-widest">PUBLISHED</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-100 text-[10px] font-black tracking-widest uppercase px-3 py-1">Draft</Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/forms/${form.id}/submissions`} className="flex-1">
                                                <Button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl font-bold h-12 shadow-none border-none">
                                                    Data Feed
                                                </Button>
                                            </Link>
                                            <Link href={`/forms/${form.id}`} className="flex-1">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-blue-100">
                                                    Analyze
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {forms.length === 0 && (
                                <Card className="border-2 border-dashed border-slate-200 shadow-none rounded-[40px] flex items-center justify-center p-12 bg-transparent lg:col-span-3">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Plus className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">No forms created</h3>
                                        <p className="text-slate-500 font-medium mb-8">Start by building your first data collection workflow.</p>
                                        <Link href="/forms/new">
                                            <Button className="bg-slate-900 text-white rounded-2xl h-14 px-10 font-black shadow-xl">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
