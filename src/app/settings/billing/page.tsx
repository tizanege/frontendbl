"use client";

import { useState, useEffect } from "react";
import { CreditCard, History, Clock, AlertTriangle, ArrowUpRight, Zap, Ban, RefreshCw, Save, Loader2, Building, Mail, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import api from "@/lib/api";

const invoiceHistory = [
    { id: "INV-001", date: "Oct 12, 2025", amount: "$29.00", status: "Paid" },
    { id: "INV-002", date: "Sep 12, 2025", amount: "$29.00", status: "Paid" },
    { id: "INV-003", date: "Aug 12, 2025", amount: "$29.00", status: "Paid" },
];

export default function BillingDashboard() {
    const [sub, setSub] = useState<any>(null);
    const [details, setDetails] = useState({
        billing_name: "",
        billing_email: "",
        billing_address: "",
        billing_city: "",
        billing_state: "",
        billing_zip: "",
        tax_id: "",
        sector: "",
    });
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, detailRes, historyRes] = await Promise.all([
                    api.get("/billing/subscription"),
                    api.get("/billing/details"),
                    api.get("/billing/history")
                ]);
                setSub(subRes.data);
                setHistory(historyRes.data);
                if (detailRes.data) {
                    setDetails({
                        billing_name: detailRes.data.billing_name || "",
                        billing_email: detailRes.data.billing_email || "",
                        billing_address: detailRes.data.billing_address || "",
                        billing_city: detailRes.data.billing_city || "",
                        billing_state: detailRes.data.billing_state || "",
                        billing_zip: detailRes.data.billing_zip || "",
                        tax_id: detailRes.data.tax_id || "",
                        sector: detailRes.data.sector || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch billing data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateDetails = async () => {
        setSaving(true);
        try {
            await api.post("/billing/details", details);
            alert("Billing details updated successfully!");
        } catch (err) {
            alert("Failed to update billing details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto p-8 space-y-10 bg-[#FAFBFF] min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Subscriptions</h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Manage your plan, payment methods, and invoices.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center gap-2">
                        <Zap className="w-5 h-5 fill-white" />
                        Upgrade Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
                                    Current Plan
                                </Badge>
                                <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Active
                                </Badge>
                            </div>
                            <CardTitle className="text-3xl font-black text-slate-900">{sub?.plan?.name || "Free Plan"}</CardTitle>
                            <CardDescription className="text-slate-500 text-lg">
                                {sub?.next_billing_date ? (
                                    <>Next billing date: <span className="text-slate-900 font-bold">{new Date(sub.next_billing_date).toLocaleDateString()}</span></>
                                ) : (
                                    "No upcoming billing date."
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Forms Count</span>
                                        <span className="font-black text-slate-900">Unlimited</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div className="bg-blue-600 h-3 rounded-full w-[45%]" />
                                    </div>
                                    <p className="text-[12px] text-slate-400 font-medium">Using 45% of current submission allocation.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Team Seats</span>
                                        <span className="font-black text-slate-900">3 / 5 Seats</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div className="bg-blue-600 h-3 rounded-full w-[60%]" />
                                    </div>
                                    <p className="text-[12px] text-slate-400 font-medium">2 seats remaining on your current tier.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                                {sub?.next_billing_date ? `Your subscription renews automatically on ${new Date(sub.next_billing_date).toLocaleDateString()}.` : 'Free forever plan - no renewal needed.'}
                            </div>
                            <Button variant="ghost" className="text-red-500 font-bold hover:bg-red-50 hover:text-red-600">
                                <Ban className="w-4 h-4 mr-2" />
                                Cancel Subscription
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden h-fit">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="w-12 h-8 bg-white/10 rounded-lg backdrop-blur-md flex items-center justify-center font-bold text-[10px]">VISA</div>
                                </div>
                                <div className="mt-8">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Card Number</p>
                                    <p className="font-mono text-lg tracking-widest">•••• •••• •••• 4242</p>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <div>
                                        <p className="white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Expiry</p>
                                        <p className="font-bold">12/26</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-6 h-12 rounded-xl border-slate-200 font-bold hover:bg-slate-50">
                                Update Card Details
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Billing Details Section */}
                    <Card className="lg:col-span-3 border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden mt-8">
                        <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <Building className="w-6 h-6 text-blue-600" />
                                    Organizational Billing Details
                                </CardTitle>
                                <CardDescription className="text-slate-500 mt-1 font-medium">Capture correct information for invoices and receipts.</CardDescription>
                            </div>
                            <Button
                                onClick={handleUpdateDetails}
                                disabled={saving}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 px-8 font-bold flex items-center gap-2 shadow-lg shadow-slate-100"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Details</>}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Legal Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <Input
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold"
                                            placeholder="Acme Field Ops Ltd"
                                            value={details.billing_name}
                                            onChange={(e) => setDetails({ ...details, billing_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <Input
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold"
                                            placeholder="billing@acme.com"
                                            value={details.billing_email}
                                            onChange={(e) => setDetails({ ...details, billing_email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax ID / VAT Registration</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <Input
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold"
                                            placeholder="VAT-123456789"
                                            value={details.tax_id}
                                            onChange={(e) => setDetails({ ...details, tax_id: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-slate-300" />
                                        <Input
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold"
                                            placeholder="123 Field Work Street"
                                            value={details.billing_address}
                                            onChange={(e) => setDetails({ ...details, billing_address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 md:col-span-2 lg:col-span-1">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</Label>
                                        <Input
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-xs font-bold"
                                            placeholder="Lagos"
                                            value={details.billing_city}
                                            onChange={(e) => setDetails({ ...details, billing_city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</Label>
                                        <Input
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-xs font-bold"
                                            placeholder="LA"
                                            value={details.billing_state}
                                            onChange={(e) => setDetails({ ...details, billing_state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ZIP</Label>
                                        <Input
                                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-xs font-bold"
                                            placeholder="100001"
                                            value={details.billing_zip}
                                            onChange={(e) => setDetails({ ...details, billing_zip: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry Sector</Label>
                                        <Select
                                            value={details.sector}
                                            onValueChange={(val) => setDetails({ ...details, sector: val })}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-sm font-bold">
                                                <SelectValue placeholder="Select your sector" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                                <SelectItem value="logistics" className="font-bold">Logistics</SelectItem>
                                                <SelectItem value="construction" className="font-bold">Construction</SelectItem>
                                                <SelectItem value="health_tech" className="font-bold">Health Tech</SelectItem>
                                                <SelectItem value="public_sector" className="font-bold">Public Sector</SelectItem>
                                                <SelectItem value="oil_and_gas" className="font-bold">Oil and Gas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="p-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <History className="w-6 h-6 text-blue-600" />
                                Billing History
                            </CardTitle>
                            <Button variant="ghost" className="text-blue-600 font-bold">Download All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-50 hover:bg-transparent">
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Invoice ID</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Date</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Amount</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                    <TableHead className="text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length > 0 ? history.map((event) => (
                                    <TableRow key={event.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-bold text-slate-900">{event.raw_payload?.data?.reference || event.id.substring(0, 8)}</TableCell>
                                        <TableCell className="text-slate-500 font-medium">{new Date(event.processed_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-black text-slate-900">
                                            {(event.raw_payload?.data?.amount / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-50 text-green-600 border-none font-bold uppercase text-[10px]">
                                                Paid Success
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-9 rounded-lg font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                Download PDF
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">No transaction history found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
