"use client";

import { useState } from "react";
import { Check, Rocket, Zap, Crown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: "Free",
        id: "free",
        price: { monthly: 0, yearly: 0 },
        description: "Perfect for exploring our platform and starting your field operations.",
        features: ["3 Forms", "100 Submissions / month", "1 User seat", "Standard UI", "Community Support"],
        icon: Rocket,
        color: "bg-slate-500",
        buttonText: "Get Started",
    },
    {
        name: "Pro",
        id: "pro",
        price: { monthly: 29, yearly: 290 },
        description: "Advanced features for growing teams and automated workflows.",
        features: [
            "Unlimited Forms",
            "5,000 Submissions / month",
            "5 User seats",
            "Workflow Automation",
            "Priority Email Support",
            "Custom Branding",
        ],
        icon: Zap,
        color: "bg-blue-600",
        popular: true,
        buttonText: "Upgrade to Pro",
    },
    {
        name: "Business",
        id: "business",
        price: { monthly: 99, yearly: 990 },
        description: "Enterprise-grade tools for large-scale logistics and geospacial tracking.",
        features: [
            "Unlimited Submissions",
            "Unlimited User seats",
            "Geo-spatial Analytics",
            "SLA Tracking",
            "24/7 Dedicated Support",
            "API Access",
        ],
        icon: Crown,
        color: "bg-indigo-700",
        buttonText: "Start Business Trial",
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-20 px-4">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <Badge variant="outline" className="mb-4 py-1 px-4 text-blue-600 border-blue-200 bg-blue-50 font-medium tracking-wide rounded-full">
                    PRICING PLANS
                </Badge>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Scalable operations, <span className="text-blue-600">simpler billing.</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Choose the plan that fits your field operation needs. No hidden fees, just pure productivity.
                </p>

                <div className="flex justify-center mb-12">
                    <Tabs defaultValue="monthly" className="w-[400px]" onValueChange={(v) => setBillingCycle(v as any)}>
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-14">
                            <TabsTrigger value="monthly" className="rounded-lg font-semibold text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly" className="rounded-lg font-semibold text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Yearly <span className="ml-2 text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">SAVE 20%</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl overflow-hidden ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-bl-3xl">
                                Most Popular
                            </div>
                        )}
                        <CardHeader className="pt-10 pb-6 px-8">
                            <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
                                <plan.icon className="text-white w-6 h-6" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                            <CardDescription className="text-slate-500 mt-2 text-base leading-relaxed">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 flex-grow">
                            <div className="flex items-baseline mb-8">
                                <span className="text-4xl font-black text-slate-900tracking-tight">
                                    ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                                </span>
                                <span className="text-slate-500 ml-2 font-medium">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                            </div>
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start text-slate-600">
                                        <div className="bg-blue-50 rounded-full p-1 mr-3 mt-1">
                                            <Check className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 mt-4">
                            <Button
                                className={`w-full h-14 text-base font-bold rounded-2xl transition-all duration-200 ${plan.popular
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                                    }`}
                                onClick={() => { }} // Integration logic here
                            >
                                {plan.buttonText}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="max-w-3xl mx-auto mt-20 text-center">
                <div className="flex items-center justify-center space-x-2 text-slate-400 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-wide uppercase">Secured by Paystack</span>
                </div>
                <p className="text-slate-500 text-sm">
                    All payments are processed securely. You can cancel your subscription at any time from your billing dashboard.
                </p>
            </div>
        </div>
    );
}
