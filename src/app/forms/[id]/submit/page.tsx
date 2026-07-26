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
    Zap
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
                // Use public endpoint to allow unauthenticated access
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

        // Get dispatchId from URL
        const searchParams = new URLSearchParams(window.location.search);
        const dId = searchParams.get('dispatchId');
        if (dId) {
            setDispatchId(dId);
            // Mark dispatch as started and get pre-filled data
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

    // Background sync effect
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

        const interval = setInterval(syncSubmissions, 30000); // Try every 30s
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
                dispatchId: dispatchId,
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed, saving offline...", err);
            const savedId = await saveOfflineSubmission(id, fd, loc);
            setOfflineId(savedId);
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    if (!form) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Card className="text-center p-12 rounded-[40px] border-none shadow-xl max-w-sm">
                <CardTitle>Form not found</CardTitle>
                <p className="text-slate-500 mt-2">The link may be broken or the form has been archived.</p>
                {user && (
                    <Button onClick={() => router.push('/forms')} className="mt-6 w-full h-12 rounded-xl">Back to Studio</Button>
                )}
            </Card>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
            <div className="max-w-md w-full text-center">
                <div className={`w-24 h-24 ${offlineId ? 'bg-blue-50' : 'bg-green-50'} rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100`}>
                    {offlineId ? <WifiOff className="w-12 h-12 text-blue-600" /> : <CheckCircle2 className="w-12 h-12 text-green-600" />}
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                    {offlineId ? 'Saved Offline' : 'Submission Successful'}
                </h1>
                <p className="text-slate-500 font-medium mb-10">
                    {offlineId ? 'You are currently offline. Data is stored securely on your device and will sync automatically once you regain connection.' : 'Your data has been captured and synchronized with the workspace.'}
                </p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => { setSubmitted(false); setOfflineId(null); }} className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold border-none">New Submission</Button>
                    {user && (
                        <Button variant="ghost" onClick={() => router.push('/forms')} className="h-14 rounded-2xl font-bold text-slate-500">Back to Forms Studio</Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-16 px-6 pb-32">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-end mb-8">
                    {isOffline && (
                        <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                            <WifiOff className="w-3" /> Offline Mode Active
                        </Badge>
                    )}
                </div>

                <Card className="rounded-[40px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] bg-white overflow-hidden">
                    <CardHeader className="p-12 pb-8 border-b border-slate-50">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="text-white w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-slate-900 tracking-tight italic">BLESH<span className="text-blue-600 NOT-italic">FORMS</span></span>
                        </div>
                        <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">{form.name}</CardTitle>
                        <CardDescription className="text-base text-slate-500 font-medium mt-2">{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {form.schema?.fields?.map((field: any) => (
                                <div key={field.id} className="space-y-3">
                                    <Label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <Input
                                            required={field.required}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium"
                                            placeholder={field.placeholder}
                                            value={fd[field.id] || ""}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <Input
                                            type="number"
                                            required={field.required}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium"
                                            placeholder={field.placeholder}
                                            value={fd[field.id] || ""}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'date' && (
                                        <Input
                                            type="datetime-local"
                                            required={field.required}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium"
                                            value={fd[field.id] || ""}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <Select onValueChange={(val) => handleInputChange(field.id, val)} value={fd[field.id] || ""} required={field.required}>
                                            <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-medium">
                                                <SelectValue placeholder="Choose an option..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100">
                                                {field.options?.map((opt: string) => (
                                                    <SelectItem key={opt} value={opt} className="rounded-xl font-bold">{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'geotag' && (
                                        <div className="space-y-4">
                                            {loc ? (
                                                <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 relative">
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
                                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 z-[1000] flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter">Verified: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                                                        </div>
                                                        <Button type="button" variant="ghost" onClick={captureLocation} className="h-6 px-2 text-[10px] font-black text-blue-600">Recalibrate</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50/50 p-12 text-center rounded-[32px] border-2 border-dashed border-slate-100">
                                                    <MapPin className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-400 mb-6">Location access required</p>
                                                    <Button type="button" onClick={captureLocation} className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-100">
                                                        Capture Current Location
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="submit"
                                className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] mt-10"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        {offlineId ? 'Resubmit Data' : 'Submit Data'}
                                        {isOffline ? <Zap className="w-5 h-5 text-blue-400 ml-2" /> : <Send className="w-5 h-5 ml-2" />}
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
