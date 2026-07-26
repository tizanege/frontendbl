"use client";

import { useState, useEffect } from "react";
import {
    Users, UserPlus, Shield, UserCheck, MoreVertical,
    Mail, CheckCircle2, XCircle, Loader2, Crown, MapPin, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const ROLE_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    admin: { label: "Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    member: { label: "Member", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
    field_operative: { label: "Field Agent", icon: MapPin, color: "text-green-600", bg: "bg-green-50" },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_LABELS[role] ?? { label: role, icon: UserCheck, color: "text-slate-500", bg: "bg-slate-50" };
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit ${cfg.bg}`}>
            <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
        </div>
    );
}

export default function TeamPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "", role: "field_operative" });
    const [invitedResult, setInvitedResult] = useState<any>(null);

    const fetchTeam = async () => {
        if (!user) return;
        try {
            const [teamRes, statsRes] = await Promise.all([
                api.get("/team"),
                api.get("/team/stats"),
            ]);
            setMembers(teamRes.data);
            setStats(statsRes.data);
        } catch (err: any) {
            console.error("Failed to load team", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTeam();
        }
    }, [user]);

    const handleInvite = async () => {
        setInviting(true);
        try {
            const { data } = await api.post("/team/invite", inviteForm);
            setInvitedResult(data);
            await fetchTeam();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to invite member.");
        } finally {
            setInviting(false);
        }
    };

    const handleUpdateRole = async (id: string, role: string) => {
        try {
            await api.patch(`/team/${id}/role`, { role });
            await fetchTeam();
        } catch (err) {
            alert("Failed to update role.");
        }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm("Deactivate this team member?")) return;
        try {
            await api.delete(`/team/${id}`);
            await fetchTeam();
        } catch (err) {
            alert("Failed to deactivate member.");
        }
    };

    const statCards = [
        { label: "Total Members", value: stats.total ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Now", value: stats.active ?? 0, icon: Zap, color: "text-green-600", bg: "bg-green-50" },
        { label: "Administrators", value: stats.admins ?? 0, icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Field Operatives", value: stats.operatives ?? 0, icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FC] p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                                    Workforce Management
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Team Control</h1>
                            <p className="text-slate-500 font-medium mt-1">Manage roles, access, and field operative assignments.</p>
                        </div>

                        <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) setInvitedResult(null); }}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-8 font-bold shadow-xl shadow-blue-100 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" /> Invite Team Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[40px] border-none shadow-2xl max-w-md p-0 overflow-hidden">
                                {invitedResult ? (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 bg-green-50 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-2">Invitation Sent!</h2>
                                        <p className="text-slate-500 font-medium mb-6">
                                            <strong className="text-slate-900">{invitedResult.email}</strong> has been added to your team as <strong className="text-blue-600">{ROLE_LABELS[invitedResult.role]?.label}</strong>.
                                        </p>
                                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temporary Credentials</p>
                                            <p className="font-mono font-bold text-slate-900 text-sm">{invitedResult.email}</p>
                                            <p className="font-mono font-black text-blue-600">{invitedResult.tempPassword}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">⚠️ Share securely. In production, this is sent via email.</p>
                                        </div>
                                        <DialogClose asChild>
                                            <Button className="w-full rounded-2xl h-14 bg-slate-900 text-white font-bold">Done</Button>
                                        </DialogClose>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-slate-900 p-10 pb-8">
                                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                                <UserPlus className="w-6 h-6 text-white" />
                                            </div>
                                            <DialogTitle className="text-2xl font-black text-white tracking-tight">Invite a Member</DialogTitle>
                                            <DialogDescription className="text-slate-400 font-medium mt-1">
                                                Add a new field operative, analyst, or admin to your workspace.
                                            </DialogDescription>
                                        </div>
                                        <div className="p-10 space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">First Name</Label>
                                                    <Input
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
                                                        placeholder="James"
                                                        value={inviteForm.firstName}
                                                        onChange={e => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Last Name</Label>
                                                    <Input
                                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
                                                        placeholder="Okafor"
                                                        value={inviteForm.lastName}
                                                        onChange={e => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Work Email</Label>
                                                <Input
                                                    type="email"
                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
                                                    placeholder="james@company.com"
                                                    value={inviteForm.email}
                                                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">Role</Label>
                                                <Select value={inviteForm.role} onValueChange={v => setInviteForm({ ...inviteForm, role: v })}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                                        <SelectItem value="field_operative" className="rounded-xl font-bold">Field Agent</SelectItem>
                                                        <SelectItem value="member" className="rounded-xl font-bold">Member (Analyst)</SelectItem>
                                                        <SelectItem value="admin" className="rounded-xl font-bold">Administrator</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                onClick={handleInvite}
                                                disabled={inviting || !inviteForm.email || !inviteForm.firstName}
                                                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-lg shadow-blue-100 mt-2"
                                            >
                                                {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invitation"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {statCards.map((s, i) => (
                            <Card key={i} className="border-none shadow-sm rounded-[28px]">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                        <s.icon className={`w-6 h-6 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                        <p className="text-3xl font-black text-slate-900">{s.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Members Table */}
                    <Card className="border-none shadow-sm rounded-[40px] overflow-hidden">
                        <CardHeader className="p-10 pb-0 border-b border-slate-50">
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">All Members</CardTitle>
                            <CardDescription className="text-slate-400 font-medium pb-6">
                                {members.length} people in your organization
                            </CardDescription>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Member</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Role</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
                                        <th className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Joined</th>
                                        <th className="px-10 py-5 text-right" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {members.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold">No team members yet.</p>
                                                <p className="text-slate-300 text-sm">Click "Invite Team Member" to get started.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        members.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-10 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md">
                                                            {m.first_name[0]}{m.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900">{m.first_name} {m.last_name}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <Mail className="w-3 h-3 text-slate-300" />
                                                                <p className="text-xs text-slate-400 font-medium">{m.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <RoleBadge role={m.role} />
                                                </td>
                                                <td className="px-10 py-5">
                                                    {m.is_active ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                            <span className="text-xs font-black text-green-600 uppercase tracking-wider">Active</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-slate-300 rounded-full" />
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Inactive</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-5 text-slate-400 font-medium text-sm">
                                                    {new Date(m.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-10 py-5 text-right">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[180px]">
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer flex items-center gap-2"
                                                                    onClick={() => handleUpdateRole(m.id, "admin")}
                                                                >
                                                                    <Crown className="w-4 h-4 text-amber-500" /> Make Admin
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer flex items-center gap-2"
                                                                    onClick={() => handleUpdateRole(m.id, "field_operative")}
                                                                >
                                                                    <MapPin className="w-4 h-4 text-green-500" /> Set as Field Agent
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer flex items-center gap-2"
                                                                    onClick={() => handleUpdateRole(m.id, "member")}
                                                                >
                                                                    <UserCheck className="w-4 h-4 text-blue-500" /> Set as Member
                                                                </DropdownMenuItem>
                                                                <div className="h-px bg-slate-100 my-1" />
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer text-red-500 flex items-center gap-2"
                                                                    onClick={() => handleDeactivate(m.id)}
                                                                >
                                                                    <XCircle className="w-4 h-4" /> Deactivate Member
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
