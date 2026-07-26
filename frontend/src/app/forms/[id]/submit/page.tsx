"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShieldCheck,
    MapPin,
    CheckCircle2,
    ArrowLeft,
    Loader2,
    Navigation,
    Send,
    WifiOff,
    Zap,
    Plus,
    Trash2,
    Table as TableIcon,
    Camera,
    PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { saveOfflineSubmission, getUnsyncedSubmissions, markAsSynced } from "@/lib/offline-storage";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

export default function FormSubmitPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { user } = useAuth();
    const [dispatchId, setDispatchId] = useState<string | null>(null);
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fd, setFd] = useState<any>({});
    const [loc, setLoc] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [offlineId, setOfflineId] = useState<string | null>(null);

    useEffect(() => {
        // Fix for Leaflet icons - only on client
        import("leaflet").then((L) => {
            const DefaultIcon = L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });
            (L.Marker.prototype.options as any).icon = DefaultIcon;
        });
    }, []);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const { data } = await api.get(`/forms/${id}/public`);
                setForm(data);
            } catch (err) {
                console.error("Failed to load form", err);
            } finally {
                setLoading(false);
            }
        };

        const handleStatusChange = () => {
            setIsOffline(!navigator.onLine);
        };

        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        handleStatusChange();

        if (id) fetchForm();

        const searchParams = new URLSearchParams(window.location.search);
        const dId = searchParams.get('dispatchId');
        if (dId) {
            setDispatchId(dId);
            api.get(`/dispatch/${dId}`).then(res => {
                if (res.data.pre_filled_data) {
                    setFd(res.data.pre_filled_data);
                }
            }).catch(console.error);
            api.patch(`/dispatch/${dId}/status`, { status: 'started' }).catch(console.error);
        }

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, [id]);

    useEffect(() => {
        const syncSubmissions = async () => {
            if (navigator.onLine) {
                const unsynced = await getUnsyncedSubmissions();
                for (const sub of unsynced) {
                    try {
                        await api.post(`/forms/${sub.formId}/submit`, {
                            data: sub.data,
                            location: sub.location,
                        });
                        await markAsSynced(sub.id);
                    } catch (err) {
                        console.error("Failed to sync submission", sub.id, err);
                    }
                }
            }
        };

        const interval = setInterval(syncSubmissions, 30000);
        if (navigator.onLine) syncSubmissions();

        return () => clearInterval(interval);
    }, []);

    const captureLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    };

    const handleInputChange = (fieldId: string, val: any) => {
        setFd({ ...fd, [fieldId]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (!navigator.onLine) {
            const savedId = await saveOfflineSubmission(id, fd, loc);
            setOfflineId(savedId);
            setSubmitted(true);
            setSubmitting(false);
            return;
        }

        try {
            await api.post(`/forms/${id}/submit`, {
                data: fd,
                location: loc,
                dispatchId,
            });
            setSubmitted(true);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit form. Try saving offline.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    if (!form) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
            <div className="bg-white p-8 rounded-lg border border-slate-300 max-w-sm text-center shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Form Not Found</h3>
                <p className="text-sm text-slate-600 mt-2">The link may be broken or the form has been archived.</p>
                {user && (
                    <Button onClick={() => router.push('/forms')} className="mt-6 w-full h-10 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm">
                        Back to Studio
                    </Button>
                )}
            </div>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
                <div className={`w-16 h-16 ${offlineId ? 'bg-blue-50' : 'bg-green-50'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {offlineId ? <WifiOff className="w-8 h-8 text-blue-600" /> : <CheckCircle2 className="w-8 h-8 text-green-600" />}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {offlineId ? 'Saved Offline' : 'Submission Received'}
                </h1>
                <p className="text-sm text-slate-600 mb-8">
                    {offlineId ? 'You are offline. Your response is saved locally and will auto-sync when online.' : 'Thank you. Your response has been recorded successfully.'}
                </p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => { setSubmitted(false); setOfflineId(null); setFd({}); }} className="h-10 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm">
                        Submit Another Response
                    </Button>
                    {user && (
                        <Button variant="outline" onClick={() => router.push('/forms')} className="h-10 rounded border-slate-300 font-medium text-sm">
                            Return to Forms
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Status Bar */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Form Document</span>
                    {isOffline && (
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5">
                            <WifiOff className="w-3.5 h-3.5" /> Working Offline
                        </Badge>
                    )}
                </div>

                {/* Classic Flat Form Container */}
                <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">

                    {/* Classic Header Header */}
                    <div className="p-8 border-b border-slate-200 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">B</div>
                            <span className="text-xs font-bold tracking-wider uppercase text-slate-500">BLESH FORMS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{form.name}</h1>
                        {form.description && (
                            <p className="text-sm text-slate-600 mt-1">{form.description}</p>
                        )}
                    </div>

                    {/* Classic Form Body */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {form.schema?.fields?.map((field: any) => {
                                // Section Divider Field
                                if (field.type === 'section') {
                                    return (
                                        <div key={field.id} className="pt-4 pb-2 border-b border-slate-200">
                                            <h3 className="text-base font-bold text-slate-900">{field.label}</h3>
                                            {field.placeholder && (
                                                <p className="text-xs text-slate-500 mt-0.5">{field.placeholder}</p>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={field.id} className="space-y-1.5">
                                        <Label className="block text-sm font-semibold text-slate-800">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>

                                        {/* Short Text */}
                                        {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                                            <Input
                                                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                                required={field.required}
                                                className="h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                value={fd[field.id] || ""}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                        )}

                                        {/* Textarea */}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                required={field.required}
                                                rows={4}
                                                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                                                placeholder={field.placeholder || `Enter details...`}
                                                value={fd[field.id] || ""}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                        )}

                                        {/* Number */}
                                        {field.type === 'number' && (
                                            <Input
                                                type="number"
                                                required={field.required}
                                                className="h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                placeholder={field.placeholder || "0"}
                                                value={fd[field.id] || ""}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                        )}

                                        {/* Date / Time */}
                                        {field.type === 'date' && (
                                            <Input
                                                type="datetime-local"
                                                required={field.required}
                                                className="h-10 px-3 rounded border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                value={fd[field.id] || ""}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                        )}

                                        {/* Select Dropdown */}
                                        {field.type === 'select' && (
                                            <Select onValueChange={(val) => handleInputChange(field.id, val)} value={fd[field.id] || ""} required={field.required}>
                                                <SelectTrigger className="h-10 rounded border border-slate-300 bg-white text-sm text-slate-900">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>
                                                <SelectContent className="border-slate-200 shadow-md">
                                                    {field.options?.map((opt: string) => (
                                                        <SelectItem key={opt} value={opt} className="text-sm font-medium">{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {/* Checkbox */}
                                        {field.type === 'checkbox' && (
                                            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={!!fd[field.id]}
                                                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                                                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-700 font-medium">{field.placeholder || "Yes, confirm"}</span>
                                            </label>
                                        )}

                                        {/* Radio Group */}
                                        {field.type === 'radio' && (
                                            <div className="space-y-2 pt-1">
                                                {(field.options || []).map((opt: string) => (
                                                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`radio_${field.id}`}
                                                            value={opt}
                                                            checked={fd[field.id] === opt}
                                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-slate-700 font-medium">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {/* Flat Data Table Grid */}
                                        {field.type === 'table' && (
                                            <div className="space-y-3 pt-1">
                                                {(() => {
                                                    const rows: any[] = Array.isArray(fd[field.id]) && fd[field.id].length > 0
                                                        ? fd[field.id]
                                                        : Array.from({ length: field.minRows || 1 }, () => ({}));
                                                    const cols: any[] = field.columns || [];

                                                    const updateTableCell = (rIdx: number, colId: string, val: any) => {
                                                        const newRows = [...rows];
                                                        newRows[rIdx] = { ...(newRows[rIdx] || {}), [colId]: val };
                                                        handleInputChange(field.id, newRows);
                                                    };

                                                    const addRow = () => {
                                                        if (field.maxRows && rows.length >= field.maxRows) return;
                                                        handleInputChange(field.id, [...rows, {}]);
                                                    };

                                                    const removeRow = (rIdx: number) => {
                                                        if (rows.length <= (field.minRows || 1)) return;
                                                        const newRows = rows.filter((_, i) => i !== rIdx);
                                                        handleInputChange(field.id, newRows);
                                                    };

                                                    return (
                                                        <div className="border border-slate-300 rounded bg-slate-50/30 p-3 space-y-3">
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left bg-white border border-slate-200 text-xs border-collapse">
                                                                    <thead>
                                                                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                                                            <th className="p-2 w-8 text-center text-slate-400">#</th>
                                                                            {cols.map((col: any) => (
                                                                                <th key={col.id} className="p-2 border-r border-slate-200 font-semibold">
                                                                                    {col.label} {col.required && <span className="text-red-500">*</span>}
                                                                                </th>
                                                                            ))}
                                                                            <th className="p-2 w-8 text-center"></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-200">
                                                                        {rows.map((rowObj: any, rIdx: number) => (
                                                                            <tr key={rIdx} className="hover:bg-slate-50">
                                                                                <td className="p-2 text-center font-bold text-slate-400">{rIdx + 1}</td>
                                                                                {cols.map((col: any) => (
                                                                                    <td key={col.id} className="p-1.5 border-r border-slate-200">
                                                                                        {col.type === 'text' && (
                                                                                            <Input
                                                                                                required={col.required || field.required}
                                                                                                value={rowObj[col.id] || ""}
                                                                                                onChange={(e) => updateTableCell(rIdx, col.id, e.target.value)}
                                                                                                className="h-8 text-xs rounded border-slate-300 bg-white"
                                                                                                placeholder={`Enter ${col.label.toLowerCase()}`}
                                                                                            />
                                                                                        )}
                                                                                        {col.type === 'number' && (
                                                                                            <Input
                                                                                                type="number"
                                                                                                required={col.required || field.required}
                                                                                                value={rowObj[col.id] || ""}
                                                                                                onChange={(e) => updateTableCell(rIdx, col.id, e.target.value)}
                                                                                                className="h-8 text-xs rounded border-slate-300 bg-white"
                                                                                                placeholder="0"
                                                                                            />
                                                                                        )}
                                                                                        {col.type === 'date' && (
                                                                                            <Input
                                                                                                type="date"
                                                                                                required={col.required || field.required}
                                                                                                value={rowObj[col.id] || ""}
                                                                                                onChange={(e) => updateTableCell(rIdx, col.id, e.target.value)}
                                                                                                className="h-8 text-xs rounded border-slate-300 bg-white"
                                                                                            />
                                                                                        )}
                                                                                        {col.type === 'select' && (
                                                                                            <Select
                                                                                                value={rowObj[col.id] || ""}
                                                                                                onValueChange={(val) => updateTableCell(rIdx, col.id, val)}
                                                                                            >
                                                                                                <SelectTrigger className="h-8 text-xs rounded border-slate-300 bg-white">
                                                                                                    <SelectValue placeholder="Select..." />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    {(col.options || []).map((opt: string) => (
                                                                                                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                                                                                    ))}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        )}
                                                                                        {col.type === 'checkbox' && (
                                                                                            <div className="flex items-center justify-center h-8">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={!!rowObj[col.id]}
                                                                                                    onChange={(e) => updateTableCell(rIdx, col.id, e.target.checked)}
                                                                                                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                ))}
                                                                                <td className="p-1.5 text-center">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeRow(rIdx)}
                                                                                        disabled={rows.length <= (field.minRows || 1)}
                                                                                        className="p-1 rounded text-slate-400 hover:text-red-600 disabled:opacity-30"
                                                                                        title="Remove Row"
                                                                                    >
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={addRow}
                                                                    disabled={Boolean(field.maxRows && rows.length >= field.maxRows)}
                                                                    className="h-8 px-3 rounded border-slate-300 text-xs font-medium gap-1 text-slate-700 bg-white hover:bg-slate-50"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Row
                                                                </Button>
                                                                {field.maxRows && (
                                                                    <span className="text-xs text-slate-500">
                                                                        Max: {field.maxRows} rows
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Geotag Field */}
                                        {field.type === 'geotag' && (
                                            <div className="space-y-3 pt-1">
                                                {loc ? (
                                                    <div className="h-56 w-full rounded border border-slate-300 overflow-hidden relative">
                                                        <MapContainer
                                                            center={[loc.lat, loc.lng]}
                                                            zoom={15}
                                                            scrollWheelZoom={false}
                                                            className="h-full w-full"
                                                        >
                                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                            <Marker
                                                                position={[loc.lat, loc.lng]}
                                                                draggable={true}
                                                                eventHandlers={{
                                                                    dragend: (e) => {
                                                                        const marker = e.target;
                                                                        const position = marker.getLatLng();
                                                                        setLoc({ lat: position.lat, lng: position.lng });
                                                                    }
                                                                }}
                                                            />
                                                        </MapContainer>
                                                        <div className="absolute bottom-3 left-3 right-3 bg-white p-2.5 rounded border border-slate-300 z-[1000] flex items-center justify-between shadow-sm">
                                                            <div className="flex items-center gap-1.5">
                                                                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                                                <span className="text-xs font-semibold text-slate-800">Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                                                            </div>
                                                            <Button type="button" variant="ghost" onClick={captureLocation} className="h-7 px-2 text-xs font-semibold text-blue-600">Recalibrate</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 p-8 text-center rounded border border-dashed border-slate-300">
                                                        <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                                        <p className="text-xs font-medium text-slate-600 mb-4">Location coordinates required</p>
                                                        <Button type="button" onClick={captureLocation} className="h-9 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                                                            Get Current Coordinates
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </div>
                                );
                            })}

                            <div className="pt-4 border-t border-slate-200">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            {offlineId ? 'Save Offline Submission' : 'Submit Form'}
                                            {isOffline ? <Zap className="w-4 h-4 text-amber-300" /> : <Send className="w-4 h-4" />}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 font-medium">
                    Powered by Blesh Forms • Secured with SSL Encryption
                </p>

            </div>
        </div>
    );
}
