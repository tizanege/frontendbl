"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Rocket, Loader2, User, Building, Mail, Lock, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        companyName: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await register(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Try a different company name or email.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100">
            {/* --- Left Side: Onboarding Roadmap --- */}
            <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-slate-900 flex-col p-16 justify-between">
                {/* background elements */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-600/10 blur-[120px]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-20">
                        <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="text-slate-900 w-7 h-7" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight italic">BLESH<span className="text-blue-500 NOT-italic">FORMS</span></span>
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                            Build your <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">spatial HQ</span> in minutes.
                        </h2>

                        <div className="space-y-8">
                            {[
                                { step: "01", title: "Create Identity", desc: "Set up your workspace and secure your domain." },
                                { step: "02", title: "Design Network", desc: "Craft custom forms and spatial entry points." },
                                { step: "03", title: "Scale Operations", desc: "Deploy field agents and track real-time intelligence." }
                            ].map(({ step, title, desc }) => (
                                <div key={step} className="flex gap-6 group">
                                    <div className="text-blue-500 font-black text-xl leading-none opacity-40 group-hover:opacity-100 transition-opacity font-mono">{step}</div>
                                    <div>
                                        <p className="text-white font-bold text-lg mb-1">{title}</p>
                                        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-blue-400">Join 2,000+ teams</p>
                    </div>
                    <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                        &quot;The mapping capabilities alone saved us 40 hours of manual data processing in the first month.&quot;
                    </p>
                </div>
            </div>

            {/* --- Right Side: Registration Form --- */}
            <div className="w-full lg:w-[60%] flex flex-col justify-center items-center p-8 lg:p-20 relative bg-[#fdfdfd] overflow-y-auto">
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zm-24 12v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zM24 24v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zM0 0h2v2H0V0zm4 4h2v2H4V4zm8 8h2v2h-2v-2zm-8 0h2v2H4v-2zm8-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zM45 45h2v2h-2v-2zm10 10h2v2h-2v-2zm-10 0h2v2h-2v-2zm10-10h2v2h-2v-2zm-10-10h2v2h-2v-2zm10 0h2v2h-2v-2zm-10-10h2v2h-2v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                <div className="w-full max-w-xl relative z-10">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1">Enterprise Preview</Badge>
                            <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 underline underline-offset-4 decoration-slate-200">
                                <Sparkles className="w-3 h-3" /> Early Access v2.1
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none">Complete Registration</h1>
                        <p className="text-slate-500 font-medium text-lg">No credit card required. Cancel anytime.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-5 rounded-[24px] text-xs font-bold border border-red-100 animate-in fade-in zoom-in-95">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">First Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="firstName"
                                        placeholder="Jane"
                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm hover:border-slate-300"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">Organization</Label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="companyName"
                                    placeholder="Acme Spatial Intelligence"
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">Work Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jane@company.com"
                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">Secure Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <p className="text-[11px] text-slate-600 font-medium">By creating an account, you agree to the <Link href="#" className="font-bold text-slate-900 underline">Global Terms of Service</Link>.</p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-blue-200 group"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Initialize Platform <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></>}
                        </Button>
                    </form>

                    <p className="mt-12 text-center text-slate-500 font-medium text-sm">
                        Already have an operational account? <Link href="/login" className="text-blue-600 font-black hover:underline underline-offset-4">Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Visual utility component
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-slate-100 text-slate-900 ${className}`}>
            {children}
        </div>
    );
}
