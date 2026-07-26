"use client";

import { useState } from "react";
import {
    Settings, User, Bell, Shield, Globe, CreditCard, ChevronRight,
    Save, Loader2, Lock, Key, Smartphone, Mail, AlertTriangle,
    MapPin, Clock, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

type SettingsTab = "profile" | "security" | "notifications" | "regional";

export default function SettingsPage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    // Security state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("30");

    // Notification state
    const [emailSubmissions, setEmailSubmissions] = useState(true);
    const [emailDispatch, setEmailDispatch] = useState(true);
    const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);
    const [pushSubmissions, setPushSubmissions] = useState(true);
    const [pushDispatch, setPushDispatch] = useState(true);
    const [pushSystem, setPushSystem] = useState(true);
    const [desktopAnalytics, setDesktopAnalytics] = useState(true);
    const [betaAccess, setBetaAccess] = useState(false);

    // Regional state
    const [timezone, setTimezone] = useState("Africa/Lagos");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
    const [language, setLanguage] = useState("en");
    const [currency, setCurrency] = useState("NGN");

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    const categories = [
        { id: "profile" as SettingsTab, label: "Profile Info", icon: User },
        { id: "security" as SettingsTab, label: "Security", icon: Shield },
        { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
        { id: "regional" as SettingsTab, label: "Regional", icon: Globe },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                                System Preferences
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your account and workspace configuration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Navigation */}
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${activeTab === cat.id
                                        ? 'bg-white shadow-md shadow-slate-200/50 text-blue-600'
                                        : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-5 h-5" />
                                        <span className="font-bold text-sm">{cat.label}</span>
                                    </div>
                                    {activeTab === cat.id && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                                </div>
                            ))}

                            {/* Billing link — separate route */}
                            <Link href="/settings/billing">
                                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all group cursor-pointer text-slate-500 hover:text-slate-900">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5" />
                                        <span className="font-bold text-sm">Plan & Billing</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-3 space-y-6">

                            {/* ═══ PROFILE TAB ═══════════════════════════════ */}
                            {activeTab === "profile" && (
                                <>
                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900">Personal Information</CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Updated profile details for team communication.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100">
                                                    {user?.email?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold h-11">Change Avatar</Button>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Email Address</Label>
                                                    <Input readOnly value={user?.email || ""} className="h-12 rounded-xl border-slate-100 bg-slate-50 font-medium text-slate-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Account ID</Label>
                                                    <Input readOnly value={user?.id || "---"} className="h-12 rounded-xl border-slate-100 bg-slate-50 font-mono text-xs text-slate-500" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">First Name</Label>
                                                    <Input placeholder="Enter first name" className="h-12 rounded-xl border-slate-200 font-medium" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Last Name</Label>
                                                    <Input placeholder="Enter last name" className="h-12 rounded-xl border-slate-200 font-medium" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Role</Label>
                                                <Input readOnly value={user?.role || "admin"} className="h-12 rounded-xl border-slate-100 bg-slate-50 font-medium text-slate-500 capitalize" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* ═══ SECURITY TAB ══════════════════════════════ */}
                            {activeTab === "security" && (
                                <>
                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Lock className="w-5 h-5 text-blue-600" /> Change Password
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Update your password to keep your account secure.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-5">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Current Password</Label>
                                                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password" className="h-12 rounded-xl border-slate-200 font-medium" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">New Password</Label>
                                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Min 8 characters" className="h-12 rounded-xl border-slate-200 font-medium" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Confirm Password</Label>
                                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Re-enter password" className="h-12 rounded-xl border-slate-200 font-medium" />
                                                    {confirmPassword && newPassword !== confirmPassword && (
                                                        <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                                                            <AlertTriangle className="w-3 h-3" /> Passwords do not match
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Smartphone className="w-5 h-5 text-blue-600" /> Two-Factor Authentication
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Add an extra layer of security to your account.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Enable 2FA</p>
                                                    <p className="text-sm text-slate-500 font-medium">Require a verification code when signing in.</p>
                                                </div>
                                                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                                            </div>
                                            {twoFactorEnabled && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                                                    <p className="text-sm font-bold text-blue-900 mb-1">Authenticator App Required</p>
                                                    <p className="text-xs text-blue-600 font-medium">Use Google Authenticator, Authy, or any TOTP-compatible app to scan the QR code that will be displayed after saving.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Key className="w-5 h-5 text-blue-600" /> Session Management
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Control how long sessions remain active.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Session Timeout (minutes)</Label>
                                                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="15">15 minutes</SelectItem>
                                                        <SelectItem value="30">30 minutes</SelectItem>
                                                        <SelectItem value="60">1 hour</SelectItem>
                                                        <SelectItem value="120">2 hours</SelectItem>
                                                        <SelectItem value="480">8 hours</SelectItem>
                                                        <SelectItem value="1440">24 hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[11px] text-slate-400 font-medium">Automatically log out after this period of inactivity.</p>
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div>
                                                <Button variant="outline" className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 font-bold h-11">
                                                    Sign Out All Other Sessions
                                                </Button>
                                                <p className="text-[11px] text-slate-400 font-medium mt-2">Revoke access from all devices except this one.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* ═══ NOTIFICATIONS TAB ══════════════════════════ */}
                            {activeTab === "notifications" && (
                                <>
                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" /> Email Notifications
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Choose which emails you want to receive.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">New Submissions</p>
                                                    <p className="text-sm text-slate-500 font-medium">Get notified when a form receives a new submission.</p>
                                                </div>
                                                <Switch checked={emailSubmissions} onCheckedChange={setEmailSubmissions} />
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Dispatch Updates</p>
                                                    <p className="text-sm text-slate-500 font-medium">Get notified when a dispatch status changes.</p>
                                                </div>
                                                <Switch checked={emailDispatch} onCheckedChange={setEmailDispatch} />
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Weekly Digest</p>
                                                    <p className="text-sm text-slate-500 font-medium">Receive a weekly summary of all operations activity.</p>
                                                </div>
                                                <Switch checked={emailWeeklyReport} onCheckedChange={setEmailWeeklyReport} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Bell className="w-5 h-5 text-blue-600" /> Push Notifications
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Real-time alerts delivered to your browser.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Submission Alerts</p>
                                                    <p className="text-sm text-slate-500 font-medium">Instant push when a field agent submits data.</p>
                                                </div>
                                                <Switch checked={pushSubmissions} onCheckedChange={setPushSubmissions} />
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Dispatch Alerts</p>
                                                    <p className="text-sm text-slate-500 font-medium">Get notified when tasks are assigned or completed.</p>
                                                </div>
                                                <Switch checked={pushDispatch} onCheckedChange={setPushDispatch} />
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">System Announcements</p>
                                                    <p className="text-sm text-slate-500 font-medium">Product updates, maintenance windows, and downtime alerts.</p>
                                                </div>
                                                <Switch checked={pushSystem} onCheckedChange={setPushSystem} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900">Other Preferences</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Desktop Analytics</p>
                                                    <p className="text-sm text-slate-500 font-medium">Capture usage metrics to improve experience.</p>
                                                </div>
                                                <Switch checked={desktopAnalytics} onCheckedChange={setDesktopAnalytics} />
                                            </div>
                                            <Separator className="bg-slate-50" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900">Beta Access</p>
                                                    <p className="text-sm text-slate-500 font-medium">Try out new features before the public release.</p>
                                                </div>
                                                <Switch checked={betaAccess} onCheckedChange={setBetaAccess} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* ═══ REGIONAL TAB ══════════════════════════════ */}
                            {activeTab === "regional" && (
                                <>
                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-blue-600" /> Date, Time & Locale
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Configure how dates, times, and numbers are displayed.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Timezone</Label>
                                                    <Select value={timezone} onValueChange={setTimezone}>
                                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</SelectItem>
                                                            <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</SelectItem>
                                                            <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</SelectItem>
                                                            <SelectItem value="Africa/Cairo">Africa/Cairo (EET, UTC+2)</SelectItem>
                                                            <SelectItem value="Europe/London">Europe/London (GMT, UTC+0)</SelectItem>
                                                            <SelectItem value="America/New_York">America/New York (EST, UTC-5)</SelectItem>
                                                            <SelectItem value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Date Format</Label>
                                                    <Select value={dateFormat} onValueChange={setDateFormat}>
                                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (22/02/2026)</SelectItem>
                                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (02/22/2026)</SelectItem>
                                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-02-22)</SelectItem>
                                                            <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY (22-Feb-2026)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Languages className="w-5 h-5 text-blue-600" /> Language & Currency
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Set your preferred language and currency display.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Display Language</Label>
                                                    <Select value={language} onValueChange={setLanguage}>
                                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="fr">Français</SelectItem>
                                                            <SelectItem value="pt">Português</SelectItem>
                                                            <SelectItem value="ar">العربية</SelectItem>
                                                            <SelectItem value="sw">Kiswahili</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Currency</Label>
                                                    <Select value={currency} onValueChange={setCurrency}>
                                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="NGN">₦ Nigerian Naira (NGN)</SelectItem>
                                                            <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                                                            <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                                                            <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                                                            <SelectItem value="ZAR">R South African Rand (ZAR)</SelectItem>
                                                            <SelectItem value="KES">KSh Kenyan Shilling (KES)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                        <CardHeader className="p-8 pb-0">
                                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-blue-600" /> Geo Defaults
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium pb-2">Default map center and coordinate system for new forms.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Default Latitude</Label>
                                                    <Input defaultValue="9.0820" placeholder="e.g. 9.0820" className="h-12 rounded-xl border-slate-200 font-mono text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Default Longitude</Label>
                                                    <Input defaultValue="8.6753" placeholder="e.g. 8.6753" className="h-12 rounded-xl border-slate-200 font-mono text-sm" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium">These coordinates are used as the default center when rendering field maps and geo-tagged submissions.</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Save Button — shared across all tabs */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" className="rounded-2xl h-14 px-8 font-bold text-slate-500 hover:text-slate-900">Discard Changes</Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-bold shadow-xl shadow-blue-100"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <div className="flex items-center gap-2">
                                            <Save className="w-5 h-5" />
                                            <span>Save Preferences</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
