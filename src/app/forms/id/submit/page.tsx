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
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

export default function FormSubmitPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fd, setFd] = useState<any>({});
    const [loc, setLoc] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const { data } = await api.get(`/forms/${id}`);
                setForm(data);
            } catch (err) {
                console.error("Failed to load form", err);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

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
        try {
            await api.post(`/forms/${id}/submit`, {
                data: fd,
                location: loc,
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed", err);
            alert("Failed to submit data. Please try again.");
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
                <Button onClick={() => router.push('/forms')} className="mt-4">Back to Studio</Button>
            </Card>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Submission Successful</h1>
                <p className="text-slate-500 font-medium mb-10">Your data has been captured and synchronized with the workspace.</p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => setSubmitted(false)} className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold border-none">New Submission</Button>
                    <Button variant="ghost" onClick={() => router.push('/forms')} className="h-14 rounded-2xl font-bold text-slate-500">Back to Forms</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-16 px-6 pb-32">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 font-bold text-slate-400 hover:text-slate-900 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>

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
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <Input
                                            type="number"
                                            required={field.required}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium"
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'date' && (
                                        <Input
                                            type="datetime-local"
                                            required={field.required}
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-medium"
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <Select onValueChange={(val) => handleInputChange(field.id, val)} required={field.required}>
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
                                        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 border-dashed">
                                            {loc ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                            <Navigation className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900 uppercase">Coordinates Locked</p>
                                                            <p className="text-[10px] font-bold text-slate-400 tracking-wider">LAT: {loc.lat.toFixed(5)} | LNG: {loc.lng.toFixed(5)}</p>
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" onClick={captureLocation} className="text-blue-600 font-bold text-xs h-8">Refresh</Button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <MapPin className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-slate-400 mb-4">Location capture required for this submission.</p>
                                                    <Button
                                                        type="button"
                                                        onClick={captureLocation}
                                                        className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-bold rounded-xl h-10 px-6 text-xs shadow-sm"
                                                    >
                                                        Allow Location Access
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
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Data <Send className="w-5 h-5" /></>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
