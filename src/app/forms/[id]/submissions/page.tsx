"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Download,
    MapPin,
    Table as TableIcon,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    User as UserIcon,
    Loader2,
    LayoutGrid,
    Map as MapIcon,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Dynamic import for the Map component to handle SSR
const FieldMap = dynamic(() => import("@/components/FieldMap"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-50 animate-pulse rounded-[40px]" />
});

export default function SubmissionsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

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
                console.error("Failed to fetch submissions", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const exportPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.text("Field Operations Report", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Form: ${form.name}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
        doc.text(`Total Submissions: ${submissions.length}`, 14, 44);

        const tableColumn = ["ID", "Captured At", ...form.schema.fields.map((f: any) => f.label), "Location"];
        const tableRows = submissions.map(sub => [
            sub.id.substring(0, 8).toUpperCase(),
            new Date(sub.submitted_at).toLocaleString(),
            ...form.schema.fields.map((f: any) => sub.data[f.id] || "N/A"),
            sub.location ? `${sub.location.lat.toFixed(4)}, ${sub.location.lng.toFixed(4)}` : "No Geo"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' as const },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(`${form.name}_Report.pdf`);
    };

    const geoSubmissions = submissions.filter(s => s.location && s.location.lat && s.location.lng);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FC] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/forms')}
                            className="h-12 w-12 rounded-2xl border-slate-200 p-0 hover:bg-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {form?.name} <span className="text-slate-300 font-medium">/ Data</span>
                            </h1>
                            <p className="text-slate-500 font-medium">{submissions.length} Total Submissions Captured</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex items-center shadow-sm">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('table')}
                                className={`rounded-xl h-10 px-4 font-bold flex items-center gap-2 ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                            >
                                <TableIcon className="w-4 h-4" /> Table
                            </Button>
                            <Button
                                variant={viewMode === 'map' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('map')}
                                className={`rounded-xl h-10 px-4 font-bold flex items-center gap-2 ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                            >
                                <MapIcon className="w-4 h-4" /> Map
                            </Button>
                        </div>
                        <div className="w-px h-8 bg-slate-200 mx-2" />
                        <Button
                            onClick={exportPDF}
                            variant="outline"
                            className="rounded-xl border-slate-200 font-bold h-12 px-6 flex items-center gap-2 bg-white hover:bg-slate-50"
                        >
                            <FileText className="w-4 h-4 text-red-500" /> PDF
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    const { data } = await api.get(`/forms/${id}/export`, { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `submissions-${id}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                } catch (err) {
                                    alert("Failed to export CSV");
                                }
                            }}
                            variant="outline"
                            className="rounded-xl border-slate-200 font-bold h-12 px-6 flex items-center gap-2 bg-white hover:bg-slate-50"
                        >
                            <Download className="w-4 h-4 text-blue-500" /> CSV
                        </Button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search submissions..."
                                    className="pl-12 h-14 rounded-[20px] border-slate-100 bg-slate-50/50 focus:bg-white font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" className="rounded-xl font-bold flex items-center gap-2 text-slate-500 hover:text-slate-900">
                                    <Filter className="w-4 h-4" /> Advanced Filter
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Submission ID</th>
                                        <th className="px-10 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Captured At</th>
                                        {form?.schema?.fields?.slice(0, 3).map((f: any) => (
                                            <th key={f.id} className="px-10 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">{f.label}</th>
                                        ))}
                                        <th className="px-10 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Location</th>
                                        <th className="px-10 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-10 py-32 text-center">
                                                <div className="max-w-xs mx-auto">
                                                    <TableIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <h3 className="text-slate-900 font-bold text-lg">No data yet</h3>
                                                    <p className="text-slate-400 text-sm mt-1">Start your field operations to see data flowing in real-time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-10 py-6 font-bold text-slate-400 text-xs">
                                                    #{sub.id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </td>
                                                {form?.schema?.fields?.slice(0, 3).map((f: any) => (
                                                    <td key={f.id} className="px-10 py-6 font-medium text-slate-600">
                                                        {sub.data[f.id] || <span className="text-slate-200 text-xs">—</span>}
                                                    </td>
                                                ))}
                                                <td className="px-10 py-6">
                                                    {sub.location ? (
                                                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 flex items-center gap-1.5 w-fit rounded-lg">
                                                            <MapPin className="w-3 h-3" /> Pin Dropped
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No Geo</span>
                                                    )}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 transition-colors">
                                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[160px]">
                                                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer">View Full Details</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="rounded-xl font-bold cursor-pointer"
                                                                onClick={() => setViewMode('map')}
                                                            >
                                                                View on Map
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer text-red-500">Flag Submission</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="h-[700px] w-full animate-in zoom-in-95 duration-500">
                        {geoSubmissions.length > 0 ? (
                            <FieldMap
                                submissions={submissions}
                                center={[geoSubmissions[0].location!.lat, geoSubmissions[0].location!.lng]}
                                zoom={12}
                            />
                        ) : (
                            <Card className="h-full flex items-center justify-center rounded-[40px] border-none shadow-sm">
                                <div className="text-center">
                                    <MapIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900">No Geospatial Data</h3>
                                    <p className="text-slate-400 font-medium mt-2">Add a Geo Location field to your form to enable map visualization.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-8 rounded-xl font-bold border-slate-200"
                                        onClick={() => setViewMode('table')}
                                    >
                                        Back to Table
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
