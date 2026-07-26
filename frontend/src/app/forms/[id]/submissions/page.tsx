"use client";

import React from "react";
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
    FileText,
    ChevronDown,
    ChevronRight,
    Eye
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

/** Format a simple scalar value for display */
function formatScalarValue(val: any): string {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
}

/** Render an inline mini-table for table field data in the on-screen view */
function TableFieldPreview({ rows, columns }: { rows: any[]; columns: any[] }) {
    if (!rows || rows.length === 0) {
        return <span className="text-slate-300 text-xs italic">No rows</span>;
    }
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider w-8">#</th>
                        {columns.map((col: any) => (
                            <th key={col.id} className="px-3 py-2 text-left font-black text-slate-500 text-[10px] uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row: any, rowIdx: number) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 text-slate-400 font-bold">{rowIdx + 1}</td>
                            {columns.map((col: any) => (
                                <td key={col.id} className="px-3 py-2 text-slate-700 font-medium">
                                    {col.type === "checkbox" ? (
                                        row[col.id] ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">No</span>
                                        )
                                    ) : (
                                        formatScalarValue(row[col.id])
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function SubmissionsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

    const toggleRowExpanded = (subId: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(subId)) next.delete(subId);
            else next.add(subId);
            return next;
        });
    };

    // Check if the form has any table fields
    const tableFields = form?.schema?.fields?.filter((f: any) => f.type === "table") || [];
    const hasTableFields = tableFields.length > 0;

    /** Export PDF with each submission formatted as vertical rows (field per row) */
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: "portrait" });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header Banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Field Operations Report", 14, 18);

        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.setFont("helvetica", "normal");
        doc.text(`Form: ${form.name}  |  Generated: ${new Date().toLocaleString()}  |  Total Submissions: ${submissions.length}`, 14, 28);

        let currentY = 43;

        submissions.forEach((sub, subIdx) => {
            // Check remaining vertical space before adding a new submission section
            if (currentY > pageHeight - 60) {
                doc.addPage();
                currentY = 20;
            }

            // Submission Section Title Bar
            doc.setFillColor(241, 245, 249); // slate-100
            doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');

            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            const locationStr = sub.location ? `${sub.location.lat.toFixed(4)}, ${sub.location.lng.toFixed(4)}` : "No Geo";
            doc.text(
                `Submission #${subIdx + 1}  •  ID: ${sub.id.substring(0, 8).toUpperCase()}  •  Captured: ${new Date(sub.submitted_at).toLocaleString()}  •  Location: ${locationStr}`,
                18,
                currentY + 8
            );

            currentY += 15;

            // Build key-value rows for regular fields (Field Name on row 1, Value on row 1)
            const fieldRows: string[][] = [];
            const nestedTableFields: any[] = [];

            (form.schema?.fields || []).forEach((field: any) => {
                if (field.type === "table") {
                    nestedTableFields.push(field);
                } else {
                    const value = formatScalarValue(sub.data[field.id]);
                    fieldRows.push([field.label, value]);
                }
            });

            if (fieldRows.length > 0) {
                autoTable(doc, {
                    head: [["Field Name", "Value / Response"]],
                    body: fieldRows,
                    startY: currentY,
                    margin: { left: 14, right: 14 },
                    theme: 'striped',
                    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
                    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
                    columnStyles: {
                        0: { cellWidth: 70, fontStyle: 'bold', fillColor: [248, 250, 252] },
                        1: { cellWidth: 'auto' }
                    },
                });

                currentY = (doc as any).lastAutoTable.finalY + 8;
            }

            // Render Data Table fields as separate full-width grids under the submission
            nestedTableFields.forEach((tf: any) => {
                const rows = sub.data[tf.id];
                const cols = tf.columns || [];

                if (Array.isArray(rows) && rows.length > 0 && cols.length > 0) {
                    if (currentY > pageHeight - 40) {
                        doc.addPage();
                        currentY = 20;
                    }

                    doc.setFontSize(9);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(37, 99, 235); // blue-600
                    doc.text(`Grid Table: ${tf.label} (${rows.length} Row${rows.length === 1 ? '' : 's'})`, 14, currentY);
                    currentY += 4;

                    const gridHeaders = ["#", ...cols.map((c: any) => c.label)];
                    const gridRows = rows.map((row: any, rIdx: number) => [
                        String(rIdx + 1),
                        ...cols.map((c: any) => {
                            const v = row[c.id];
                            if (c.type === "checkbox") return v ? "Yes" : "No";
                            return formatScalarValue(v);
                        })
                    ]);

                    autoTable(doc, {
                        head: [gridHeaders],
                        body: gridRows,
                        startY: currentY,
                        margin: { left: 14, right: 14 },
                        theme: 'grid',
                        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
                        bodyStyles: { fontSize: 8 },
                        alternateRowStyles: { fillColor: [239, 246, 255] },
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 8;
                }
            });

            currentY += 8;
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
                                        <th className="px-4 py-6 w-10"></th>
                                        <th className="px-8 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Submission ID</th>
                                        <th className="px-8 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Captured At</th>
                                        {form?.schema?.fields?.slice(0, 4).map((f: any) => (
                                            <th key={f.id} className="px-8 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                                                {f.label}
                                                {f.type === "table" && (
                                                    <Badge className="ml-2 bg-blue-50 text-blue-600 border-blue-200 text-[8px] px-1.5 py-0 font-bold">GRID</Badge>
                                                )}
                                            </th>
                                        ))}
                                        <th className="px-8 py-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Location</th>
                                        <th className="px-8 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={20} className="px-10 py-32 text-center">
                                                <div className="max-w-xs mx-auto">
                                                    <TableIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <h3 className="text-slate-900 font-bold text-lg">No data yet</h3>
                                                    <p className="text-slate-400 text-sm mt-1">Start your field operations to see data flowing in real-time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        submissions.map((sub) => {
                                            const isExpanded = expandedRows.has(sub.id);

                                            return (
                                                <React.Fragment key={sub.id}>
                                                    <tr className="hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => toggleRowExpanded(sub.id)}>
                                                        <td className="px-4 py-6">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleRowExpanded(sub.id); }}
                                                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="w-4 h-4 text-blue-600" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-8 py-6 font-bold text-slate-400 text-xs">
                                                            #{sub.id.substring(0, 8).toUpperCase()}
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="font-bold text-slate-900 text-sm">
                                                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium">
                                                                    {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        {form?.schema?.fields?.slice(0, 4).map((f: any) => (
                                                            <td key={f.id} className="px-8 py-6 font-medium text-slate-600">
                                                                {f.type === "table" && Array.isArray(sub.data[f.id]) ? (
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] px-2.5 py-1 rounded-lg">
                                                                        <TableIcon className="w-3 h-3 mr-1.5" />
                                                                        {sub.data[f.id].length} Row{sub.data[f.id].length === 1 ? '' : 's'}
                                                                    </Badge>
                                                                ) : (
                                                                    formatScalarValue(sub.data[f.id])
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="px-8 py-6">
                                                            {sub.location ? (
                                                                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 flex items-center gap-1.5 w-fit rounded-lg">
                                                                    <MapPin className="w-3 h-3" /> Pin Dropped
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No Geo</span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 transition-colors">
                                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[160px]">
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl font-bold cursor-pointer"
                                                                        onClick={() => toggleRowExpanded(sub.id)}
                                                                    >
                                                                        {isExpanded ? "Collapse Details" : "View Full Details"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl font-bold cursor-pointer"
                                                                        onClick={() => setViewMode('map')}
                                                                    >
                                                                        View on Map
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row: Full vertical card displaying all fields line by line */}
                                                    {isExpanded && (
                                                        <tr className="bg-slate-50/50">
                                                            <td colSpan={20} className="px-8 py-6">
                                                                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                                        <h4 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
                                                                            <FileText className="w-4 h-4 text-blue-600" />
                                                                            Full Submission Record (#{sub.id.substring(0, 8).toUpperCase()})
                                                                        </h4>
                                                                        <span className="text-xs font-bold text-slate-400">
                                                                            Submitted on {new Date(sub.submitted_at).toLocaleString()}
                                                                        </span>
                                                                    </div>

                                                                    {/* Regular Fields Vertical List */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {(form?.schema?.fields || [])
                                                                            .filter((f: any) => f.type !== "table")
                                                                            .map((f: any) => (
                                                                                <div key={f.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
                                                                                    <p className="text-sm font-bold text-slate-800">{formatScalarValue(sub.data[f.id])}</p>
                                                                                </div>
                                                                            ))}
                                                                    </div>

                                                                    {/* Data Table Fields Grids */}
                                                                    {tableFields.map((tf: any) => {
                                                                        const rows = sub.data[tf.id];
                                                                        if (!Array.isArray(rows) || rows.length === 0) return null;
                                                                        const cols = tf.columns || [];

                                                                        return (
                                                                            <div key={tf.id} className="pt-2">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <TableIcon className="w-4 h-4 text-blue-600" />
                                                                                    <h5 className="font-black text-slate-800 text-sm tracking-tight">{tf.label}</h5>
                                                                                    <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[9px] px-2 py-0 font-bold">
                                                                                        {rows.length} Row{rows.length === 1 ? '' : 's'}
                                                                                    </Badge>
                                                                                </div>
                                                                                <TableFieldPreview rows={rows} columns={cols} />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
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
