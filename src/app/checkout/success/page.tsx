"use client";

import { CheckCircle2, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Fire confetti for the premium experience
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-6 h-6 animate-pulse" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Payment Successful!</h1>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                    Welcome to the <span className="text-blue-600 font-bold">Pro Plan</span>. Your subscription is now active and all premium features are unlocked.
                </p>

                <div className="space-y-4 mb-10 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Amount Paid</span>
                        <span className="text-slate-900 font-black">$29.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Plan</span>
                        <span className="text-slate-900 font-black">Pro (Monthly)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Transaction ID</span>
                        <span className="text-slate-400 font-mono text-[10px]">PAY-827364510B</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 group">
                            Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full text-slate-500 font-bold h-12 rounded-xl flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download Receipt
                    </Button>
                </div>
            </div>
        </div>
    );
}
