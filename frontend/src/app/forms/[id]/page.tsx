"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BarChart3,
    Users,
    Clock,
    Share2,
    Settings2,
    Eye,
    ChevronRight,
    Loader2,
    Calendar,
    Download,
    FileText,
    ExternalLink,
    ShieldCheck,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FormDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formRes, subRes] = await Promise.all([
                    api.get(`/forms/${id}`),
                    api.get(`/forms/${id}/submissions`)
                ]);
                setForm(formRes.data);
                setSubmissions(subRes.data);
            } catch (err) {
                console.error("Failed to fetch form details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const copyShareLink = () => {
        const url = `${window.location.origin}/forms/${id}/submit`;
        navigator.clipboard.writeText(url);
        alert("Public link copied to clipboard!");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    if (!form) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <h1 className="text-2xl font-black text-slate-900 mb-4">Form not found</h1>
            <Button onClick={() => router.push('/forms')} className="rounded-2xl bg-slate-900">
                Back to Forms
            </Button>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Nav */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/forms')}
                            className="rounded-2xl font-bold text-slate-500 hover:text-slate-900 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Forms
                        </Button>
                        <div className="flex gap-3">
                            <Link href={`/forms/${id}/edit`}>
                                <Button variant="outline" className="rounded-2xl h-11 border-slate-200 bg-white font-bold text-slate-600 gap-2">
                                    <Settings2 className="w-4 h-4" /> Edit Workflow
                                </Button>
                            </Link>
                            <Button onClick={copyShareLink} className="rounded-2xl h-11 bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-xl shadow-blue-100">
                                <Share2 className="w-4 h-4" /> Share Form
                            </Button>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    {form.status === 'published' ? (
                                        <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-widest uppercase py-1 px-3">
                                            PUBLISHED WORKFLOW
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-white/10 text-white border-none font-black text-[10px] tracking-widest uppercase py-1 px-3">
                                            DRAFT PROTOCOL
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-5xl font-black tracking-tight">{form.name}</h1>
                                <p className="text-xl text-slate-400 font-medium max-w-2xl">{form.description || "No description provided for this operational workflow."}</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                {form.schema?.fields?.some((f: any) => f.type === 'geotag') && (
                                    <Link href={`/forms/${id}/map`}>
                                        <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black text-sm gap-2">
                                            <MapPin className="w-5 h-5" /> Geospatial Map
                                        </Button>
                                    </Link>
                                )}
                                <Link href={`/forms/${id}/submit`} target="_blank">
                                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl h-14 px-8 font-black text-sm text-white gap-2">
                                        <Eye className="w-5 h-5" /> Live Preview <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm rounded-[32px] bg-white">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
                                    <BarChart3 className="text-green-600 w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
                                <h3 className="text-4xl font-black text-slate-900">{submissions.length}</h3>
                                <div className="flex items-center gap-1.5 mt-4 text-green-600">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold font-mono uppercase">Last 30 Days</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-[32px] bg-white">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                                    <Users className="text-blue-600 w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Field Agents</p>
                                <h3 className="text-4xl font-black text-slate-900">
                                    {new Set(submissions.map(s => s.captured_by_user_id)).size || 1}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-4 text-blue-600">
                                    <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black tracking-tighter">MULTI-ROLE ENABLED</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-[32px] bg-white">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
                                    <Calendar className="text-purple-600 w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Launched On</p>
                                <h3 className="text-2xl font-black text-slate-900">
                                    {new Date(form.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">v1.2 Operations Build</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions & Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-slate-50">
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Form Overview</CardTitle>
                                <CardDescription className="font-medium">Structure and schema summary.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Field Breakdown</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {form.schema?.fields?.map((f: any) => (
                                            <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700">{f.label}</span>
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-slate-200 text-slate-400">
                                                    {f.type}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="bg-slate-50" />
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Deployment Status</span>
                                    <span className="text-green-600 font-black">Online / Accepting Responses</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links Card */}
                        <div className="space-y-6">
                            <Link href={`/forms/${id}/submissions`} className="block">
                                <Card className="border-none shadow-sm rounded-[32px] bg-white group hover:bg-slate-900 transition-all duration-500 cursor-pointer overflow-hidden relative">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                                <Download className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tight">Access Data Feed</h3>
                                                <p className="text-slate-500 group-hover:text-slate-400 font-medium transition-colors">Review and export all captured entries.</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={`/dispatch?formId=${id}`} className="block">
                                <Card className="border-none shadow-sm rounded-[32px] bg-white group hover:bg-blue-600 transition-all duration-500 cursor-pointer overflow-hidden relative">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-900 group-hover:bg-white/10 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                                                <Share2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tight">Deploy to Field</h3>
                                                <p className="text-slate-500 group-hover:text-blue-100 font-medium transition-colors">Dispatch this form to your agents.</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                                    </CardContent>
                                </Card>
                            </Link>

                            <Card className="border-none shadow-sm rounded-[32px] bg-slate-50 p-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">Operationally Secure</h4>
                                    <p className="text-xs text-slate-500 font-medium">This form is protected by tenant-level isolation.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
