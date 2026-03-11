"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock, Globe, Zap, Database, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100">
            {/* --- Left Side: Marketing/Visuals --- */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center p-20">
                {/* mesh gradient background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600 blur-[120px] animate-pulse duration-[5000ms]" />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="relative z-10 w-full max-w-lg">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                            <ShieldCheck className="text-slate-900 w-7 h-7" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight italic">BLESH<span className="text-blue-500 NOT-italic">FORMS</span></span>
                    </div>

                    <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">
                        The ultimate <span className="text-blue-500">geospatial</span> intelligence platform.
                    </h2>

                    <div className="space-y-6">
                        {[
                            { icon: BarChart3, title: "Spatial Analytics", desc: "Real-time heatmaps and cluster visualization." },
                            { icon: Database, title: "Safe Storage", desc: "Enterprise-grade encryption for field data." },
                            { icon: Globe, title: "Global Scale", desc: "Deploy forms across any territory instantly." }
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex gap-5 group cursor-default">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                    <Icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg mb-1">{title}</p>
                                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-12 border-t border-white/5 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500`}>U{i}</div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 font-bold tracking-tight">Trusted by 2,000+ teams globally</p>
                    </div>
                </div>
            </div>

            {/* --- Right Side: Login Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-20 relative bg-[#fdfdfd]">
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zm-24 12v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zM24 24v-2h-2v2h2zm4 8v-2h-2v2h2zm8 4v-2h-2v2h2zm-12 0v-2h-2v2h2zm4-8v-2h-2v2h2zm4-8v-2h-2v2h2zM0 0h2v2H0V0zm4 4h2v2H4V4zm8 8h2v2h-2v-2zm-8 0h2v2H4v-2zm8-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zm0-8h2v2h-2V4zm8 8h2v2h-2v-2zM45 45h2v2h-2v-2zm10 10h2v2h-2v-2zm-10 0h2v2h-2v-2zm10-10h2v2h-2v-2zm-10-10h2v2h-2v-2zm10 0h2v2h-2v-2zm-10-10h2v2h-2v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                <div className="w-full max-w-md relative z-10">
                    <div className="lg:hidden flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight italic">BLESH<span className="text-blue-600 NOT-italic">FORMS</span></span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Welcome back</h1>
                        <p className="text-slate-500 font-medium">Continue your spatial analytics journey.</p>
                    </div>

                    {/* Social Login Placeholders */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 font-bold transition-all flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Google
                        </Button>
                        <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 font-bold transition-all flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                            GitHub
                        </Button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-[#fdfdfd] px-4 text-slate-400">Or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-1">Work Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="alex@company.com"
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label htmlFor="password" className="text-slate-700 font-black text-[10px] uppercase tracking-widest">Password</Label>
                                <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm group-hover:border-slate-300"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 mt-6"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 font-medium text-sm">
                        New to the platform? <Link href="/register" className="text-blue-600 font-black hover:underline underline-offset-4">Create your account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
