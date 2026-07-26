"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Trash2, GripVertical, Settings2, Layout, Type, Hash,
    Calendar as CalendarIcon, CheckSquare, MapPin, Save, Eye, ArrowLeft,
    ChevronDown, AlignLeft, Mail, Phone, CircleDot, Image as ImageIcon,
    SeparatorHorizontal, Loader2, ChevronRight, Undo2, Redo2, Check,
    Cloud, CloudOff, Copy, Layers, ToggleLeft, ShieldCheck, Cog,
    FileText, Clock, ChevronUp, X, Grid3X3, AlertCircle, PenLine, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

type FieldType = "text" | "textarea" | "number" | "email" | "phone" | "date" | "select" | "checkbox" | "radio" | "geotag" | "image" | "section" | "signature" | "logo";

interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
    placeholder?: string;
    // Validation
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    // Visibility
    hidden?: boolean;
    readOnly?: boolean;
    conditionalField?: string;
    conditionalValue?: string;
    // Advanced
    helpText?: string;
    defaultValue?: string;
    cssClass?: string;
}

type FormStatus = "draft" | "published";

interface FormVersion {
    id: string;
    timestamp: Date;
    fieldCount: number;
    status: FormStatus;
}

// ─── Field Palette ──────────────────────────────────────────────────────────

const FIELD_TYPE_GROUPS = [
    {
        group: "Input",
        items: [
            { type: "text", label: "Short Text", icon: Type },
            { type: "textarea", label: "Long Text", icon: AlignLeft },
            { type: "number", label: "Number", icon: Hash },
            { type: "email", label: "Email", icon: Mail },
            { type: "phone", label: "Phone", icon: Phone },
            { type: "date", label: "Date", icon: CalendarIcon },
        ]
    },
    {
        group: "Choice",
        items: [
            { type: "select", label: "Dropdown", icon: ChevronDown },
            { type: "checkbox", label: "Checkbox", icon: CheckSquare },
            { type: "radio", label: "Radio", icon: CircleDot },
        ]
    },
    {
        group: "Special",
        items: [
            { type: "image", label: "Image", icon: ImageIcon },
            { type: "geotag", label: "Geo Pin", icon: MapPin },
            { type: "section", label: "Section", icon: SeparatorHorizontal },
        ]
    },
    {
        group: "Verification & Branding",
        items: [
            { type: "signature", label: "Signature", icon: PenLine },
            { type: "logo", label: "Logo", icon: Building },
        ]
    }
];

const ALL_FIELD_TYPES = FIELD_TYPE_GROUPS.flatMap(g => g.items);
function getFieldMeta(type: string) { return ALL_FIELD_TYPES.find(f => f.type === type) || ALL_FIELD_TYPES[0]; }

// ─── History Hook ───────────────────────────────────────────────────────────

function useHistory<T>(initial: T) {
    const [past, setPast] = useState<T[]>([]);
    const [present, setPresent] = useState<T>(initial);
    const [future, setFuture] = useState<T[]>([]);

    const push = useCallback((val: T) => {
        setPast(p => [...p.slice(-49), present]);
        setPresent(val);
        setFuture([]);
    }, [present]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        setFuture(f => [present, ...f]);
        setPresent(past[past.length - 1]);
        setPast(p => p.slice(0, -1));
    }, [past, present]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        setPast(p => [...p, present]);
        setPresent(future[0]);
        setFuture(f => f.slice(1));
    }, [future, present]);

    return { value: present, set: push, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FormBuilderPage() {
    const router = useRouter();

    // Core form state
    const [formName, setFormName] = useState("Untitled Operation");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("general");
    const [formStatus, setFormStatus] = useState<FormStatus>("draft");

    // Fields with undo/redo
    const history = useHistory<FormField[]>([]);
    const fields = history.value;

    // UI state
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [propertyTab, setPropertyTab] = useState<"general" | "validation" | "visibility" | "advanced">("general");
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
    const [showGrid, setShowGrid] = useState(true);
    const [showVersions, setShowVersions] = useState(false);
    const [versions, setVersions] = useState<FormVersion[]>([
        { id: "v3", timestamp: new Date(), fieldCount: 0, status: "draft" },
        { id: "v2", timestamp: new Date(Date.now() - 86400000), fieldCount: 4, status: "draft" },
        { id: "v1", timestamp: new Date(Date.now() - 172800000), fieldCount: 2, status: "published" },
    ]);

    // Drag state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragCounter = useRef(0);

    // Auto-save timer
    const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (fields.length === 0 && !formName) return;
        setAutoSaveStatus("unsaved");
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            setAutoSaveStatus("saving");
            // Simulate auto-save
            setTimeout(() => setAutoSaveStatus("saved"), 800);
        }, 2000);
        return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
    }, [fields, formName, description, category]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); history.undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); history.redo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); history.redo(); }
            if (e.key === 'Delete' && selectedFieldId) {
                const el = document.activeElement;
                if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
                e.preventDefault();
                removeField(selectedFieldId);
            }
            if (e.key === 'Escape') setSelectedFieldId(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedFieldId, history]);

    const selectedField = fields.find(f => f.id === selectedFieldId);

    // ── Field CRUD ────────────────────────────────────────────────────────────

    const addField = (type: FieldType) => {
        const meta = getFieldMeta(type);
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            label: meta.label + " Field",
            type,
            required: false,
            placeholder: "",
            options: ["select", "checkbox", "radio"].includes(type) ? ["Option 1", "Option 2"] : undefined,
        };
        history.set([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const removeField = (id: string) => {
        history.set(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const duplicateField = (id: string) => {
        const orig = fields.find(f => f.id === id);
        if (!orig) return;
        const copy: FormField = { ...orig, id: Math.random().toString(36).substr(2, 9), label: orig.label + " (copy)" };
        const idx = fields.findIndex(f => f.id === id);
        const updated = [...fields];
        updated.splice(idx + 1, 0, copy);
        history.set(updated);
        setSelectedFieldId(copy.id);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        history.set(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    // ── Drag & Drop ───────────────────────────────────────────────────────────

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
        const el = e.currentTarget instanceof HTMLElement ? e.currentTarget : null;
        if (el) {
            setTimeout(() => { el.style.opacity = "0.35"; }, 0);
        }
    }, []);

    const handleDragEnd = useCallback((e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "1";
        setDraggedIndex(null);
        setDragOverIndex(null);
        dragCounter.current = 0;
    }, []);

    const handleDragEnter = useCallback((_e: React.DragEvent, index: number) => {
        dragCounter.current++;
        setDragOverIndex(index);
    }, []);

    const handleDragLeave = useCallback(() => {
        dragCounter.current--;
        if (dragCounter.current === 0) setDragOverIndex(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        dragCounter.current = 0;
        if (draggedIndex === null || draggedIndex === dropIndex) { setDraggedIndex(null); setDragOverIndex(null); return; }
        const updated = [...fields];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, moved);
        history.set(updated);
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, fields, history]);

    // ── Save ──────────────────────────────────────────────────────────────────

    const saveForm = async () => {
        if (!formName) return alert("Please enter a form name");
        setIsSaving(true);
        try {
            await api.post("/forms", { name: formName, description, category, schema: { fields }, status: formStatus });
            router.push("/forms");
        } catch (err) {
            console.error("Failed to save form", err);
            alert("Failed to save form. You might have reached your plan limit.");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── RENDER ─────────────────────────────────────────────────────────────

    return (
        <div className="h-screen flex flex-col bg-[#F0F1F5] overflow-hidden">

            {/* ═══ Top Toolbar ═══════════════════════════════════════════════ */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-50">
                {/* Left: Back + Name */}
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/forms">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                            <ArrowLeft className="w-4 h-4 text-slate-500" />
                        </Button>
                    </Link>
                    <div className="w-px h-5 bg-slate-200" />
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="text-sm font-bold bg-transparent border-none outline-none text-slate-900 w-48 truncate placeholder:text-slate-300"
                            placeholder="Form name..."
                        />
                    </div>
                </div>

                {/* Center: Undo / Redo + Tools */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={history.undo} disabled={!history.canUndo}
                        className="h-8 w-8 p-0 rounded-lg disabled:opacity-30" title="Undo (Ctrl+Z)">
                        <Undo2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={history.redo} disabled={!history.canRedo}
                        className="h-8 w-8 p-0 rounded-lg disabled:opacity-30" title="Redo (Ctrl+Shift+Z)">
                        <Redo2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}
                        className={`h-8 w-8 p-0 rounded-lg ${showGrid ? "bg-blue-50 text-blue-600" : ""}`} title="Toggle Grid">
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button onClick={() => setFormStatus("draft")}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${formStatus === "draft" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
                            Draft
                        </button>
                        <button onClick={() => setFormStatus("published")}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${formStatus === "published" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                            Published
                        </button>
                    </div>
                </div>

                {/* Right: Auto-save + Publish */}
                <div className="flex items-center gap-3">
                    {/* Auto-save indicator */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                        {autoSaveStatus === "saved" && <><Cloud className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[11px] font-semibold text-emerald-600">Saved</span></>}
                        {autoSaveStatus === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /><span className="text-[11px] font-semibold text-blue-500">Saving...</span></>}
                        {autoSaveStatus === "unsaved" && <><CloudOff className="w-3.5 h-3.5 text-amber-500" /><span className="text-[11px] font-semibold text-amber-600">Unsaved</span></>}
                    </div>

                    <div className="w-px h-5 bg-slate-200" />

                    <Button variant="ghost" size="sm" onClick={() => setShowVersions(!showVersions)}
                        className="h-8 px-2 gap-1 rounded-lg text-slate-500 hover:text-slate-900" title="Version History">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold hidden lg:inline">History</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 rounded-lg text-slate-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold hidden lg:inline">Preview</span>
                    </Button>

                    <Button onClick={saveForm} disabled={isSaving} size="sm"
                        className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold gap-1.5 shadow-sm">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {formStatus === "published" ? "Publish" : "Save Draft"}
                    </Button>
                </div>
            </div>

            {/* ═══ Main Body ═════════════════════════════════════════════════ */}
            <div className="flex-1 flex overflow-hidden">

                {/* ─── Left Panel: Field Palette ──────────────────────────── */}
                <div className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Components</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {FIELD_TYPE_GROUPS.map((group) => (
                            <div key={group.group}>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-2 mb-1.5">{group.group}</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.type}
                                            onClick={() => addField(item.type as FieldType)}
                                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-center"
                                        >
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-blue-600 leading-tight">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Field count */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">{fields.length} fields</span>
                            <Badge variant="outline" className={`text-[8px] font-bold px-2 py-0 rounded-md ${formStatus === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                                {formStatus.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* ─── Center: Canvas ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto relative" onClick={(e) => { if (e.target === e.currentTarget) setSelectedFieldId(null); }}>
                    {/* Grid overlay */}
                    {showGrid && (
                        <div className="absolute inset-0 pointer-events-none z-0"
                            style={{
                                backgroundImage: "radial-gradient(circle, #d1d5db 0.5px, transparent 0.5px)",
                                backgroundSize: "24px 24px"
                            }}
                        />
                    )}

                    <div className="max-w-2xl mx-auto py-10 px-6 relative z-10">
                        {/* Form Header */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-4">
                            <input
                                className="text-2xl font-black block w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-200 mb-2"
                                placeholder="Untitled Form"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                            <textarea
                                className="text-slate-400 block w-full bg-transparent border-none outline-none resize-none font-medium text-sm placeholder:text-slate-200"
                                placeholder="Add a description for this inspection protocol..."
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sector</span>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-7 w-32 rounded-md border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="logistics">Logistics</SelectItem>
                                        <SelectItem value="construction">Construction</SelectItem>
                                        <SelectItem value="health_tech">Health Tech</SelectItem>
                                        <SelectItem value="oil_and_gas">Oil & Gas</SelectItem>
                                        <SelectItem value="public_sector">Public Sector</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Field Canvas */}
                        <div className="space-y-1.5">
                            {fields.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 backdrop-blur-sm">
                                    <Layout className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">Drop components here</p>
                                    <p className="text-slate-300 text-[11px] mt-1">Select a component from the left panel to begin</p>
                                    <p className="text-slate-200 text-[10px] mt-4 uppercase tracking-widest font-bold">12 field types • drag to reorder • undo with Ctrl+Z</p>
                                </div>
                            ) : (
                                fields.map((field, index) => {
                                    const meta = getFieldMeta(field.type);
                                    const Icon = meta.icon;
                                    const isDragging = draggedIndex === index;
                                    const isOver = dragOverIndex === index;
                                    const isSelected = selectedFieldId === field.id;

                                    return (
                                        <div key={field.id} className="relative group/item">
                                            {/* Snap indicator */}
                                            {isOver && draggedIndex !== null && draggedIndex !== index && (
                                                <div className="absolute -top-[3px] left-3 right-3 z-30 flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg" />
                                                    <div className="flex-1 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg" />
                                                </div>
                                            )}

                                            {/* Field Row */}
                                            <div
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragEnter={(e) => { e.preventDefault(); handleDragEnter(e, index); }}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                                                className={`
                                                    relative flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-all cursor-pointer select-none
                                                    ${isDragging ? "opacity-30 scale-[0.97] border-blue-300 ring-2 ring-blue-100" : ""}
                                                    ${isSelected ? "border-blue-400 ring-2 ring-blue-100 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}
                                                    ${field.type === "section" ? "border-l-[3px] border-l-purple-400" : ""}
                                                    ${field.hidden ? "opacity-50" : ""}
                                                `}
                                            >
                                                {/* Grip */}
                                                <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-blue-500 transition-colors shrink-0">
                                                    <GripVertical className="w-3.5 h-3.5" />
                                                </div>

                                                {/* Icon */}
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${field.type === "section" ? "bg-purple-50 text-purple-500" :
                                                    field.type === "geotag" ? "bg-emerald-50 text-emerald-500" :
                                                        field.type === "signature" ? "bg-indigo-50 text-indigo-600" :
                                                            field.type === "logo" ? "bg-slate-100 text-slate-600" :
                                                                field.type === "image" ? "bg-amber-50 text-amber-500" :
                                                                    "bg-blue-50 text-blue-500"
                                                    }`}>
                                                    <Icon className="w-3 h-3" />
                                                </div>

                                                {/* Label */}
                                                <input
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none min-w-0 truncate"
                                                    placeholder="Field label"
                                                />

                                                {/* Indicators */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {field.required && <div className="w-1.5 h-1.5 bg-red-400 rounded-full" title="Required" />}
                                                    {field.hidden && <Eye className="w-3 h-3 text-slate-300" />}
                                                    <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider hidden sm:inline">{meta.label}</span>
                                                </div>

                                                {/* Floating toolbar on hover/select */}
                                                <div className={`absolute -top-8 right-2 flex items-center gap-0.5 bg-slate-900 rounded-lg px-1 py-0.5 shadow-xl transition-all z-40 ${isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none group-hover/item:opacity-100 group-hover/item:translate-y-0 group-hover/item:pointer-events-auto"
                                                    }`}>
                                                    <button onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} className="p-1 text-white/60 hover:text-white rounded" title="Duplicate">
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); updateField(field.id, { required: !field.required }); }} className={`p-1 rounded ${field.required ? "text-red-400" : "text-white/60 hover:text-white"}`} title="Toggle Required">
                                                        <AlertCircle className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); updateField(field.id, { hidden: !field.hidden }); }} className={`p-1 rounded ${field.hidden ? "text-amber-400" : "text-white/60 hover:text-white"}`} title="Toggle Visibility">
                                                        <Eye className="w-3 h-3" />
                                                    </button>
                                                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                                                    <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 text-white/60 hover:text-red-400 rounded" title="Delete">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* Drop zone at bottom during drag */}
                            {fields.length > 0 && draggedIndex !== null && (
                                <div
                                    className="py-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 text-center transition-all"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, fields.length)}
                                    onDragEnter={(e) => e.preventDefault()}
                                >
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Drop to move to end</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Right Panel: Property Inspector ────────────────────── */}
                <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
                    {selectedField ? (
                        <>
                            {/* Panel Header */}
                            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    {(() => { const M = getFieldMeta(selectedField.type); return <M.icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />; })()}
                                    <span className="text-xs font-bold text-slate-900 truncate">{selectedField.label}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedFieldId(null)} className="h-6 w-6 p-0 rounded-md">
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </Button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100">
                                {(["general", "validation", "visibility", "advanced"] as const).map(tab => (
                                    <button key={tab} onClick={() => setPropertyTab(tab)}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${propertyTab === tab ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-400 hover:text-slate-600"
                                            }`}>
                                        {tab === "general" ? "General" : tab === "validation" ? "Validate" : tab === "visibility" ? "Visible" : "Advanced"}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                                {propertyTab === "general" && (
                                    <>
                                        <PropSection title="Label">
                                            <Input value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                                className="h-8 rounded-lg text-sm" />
                                        </PropSection>

                                        {selectedField.type !== "section" && (
                                            <PropSection title="Required">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-slate-500">Mandatory for submission</span>
                                                    <Switch checked={selectedField.required} onCheckedChange={(v: boolean) => updateField(selectedField.id, { required: v })} />
                                                </div>
                                            </PropSection>
                                        )}

                                        {!["geotag", "image", "section", "checkbox"].includes(selectedField.type) && (
                                            <PropSection title="Placeholder">
                                                <Input value={selectedField.placeholder || ""} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                                    placeholder="Placeholder text..." className="h-8 rounded-lg text-sm" />
                                            </PropSection>
                                        )}

                                        {["select", "checkbox", "radio"].includes(selectedField.type) && (
                                            <PropSection title="Options">
                                                <Input value={selectedField.options?.join(", ") || ""} onChange={(e) => updateField(selectedField.id, { options: e.target.value.split(",").map(s => s.trim()) })}
                                                    placeholder="Option 1, Option 2" className="h-8 rounded-lg text-sm" />
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedField.options?.filter(Boolean).map((opt, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] font-semibold rounded-md px-2 py-0.5 bg-slate-50">{opt}</Badge>
                                                    ))}
                                                </div>
                                            </PropSection>
                                        )}

                                        <PropSection title="Default Value">
                                            <Input value={selectedField.defaultValue || ""} onChange={(e) => updateField(selectedField.id, { defaultValue: e.target.value })}
                                                placeholder="Default value..." className="h-8 rounded-lg text-sm" />
                                        </PropSection>

                                        {/* Type Info */}
                                        {selectedField.type === "geotag" && <InfoBox color="blue" text="GPS coordinates captured automatically on submit." />}
                                        {selectedField.type === "image" && <InfoBox color="amber" text="Photo capture or gallery upload from device." />}
                                        {selectedField.type === "signature" && <InfoBox color="blue" text="Digital signature pad for verification." />}
                                        {selectedField.type === "logo" && <InfoBox color="blue" text="Static branding element. Upload your logo." />}
                                        {selectedField.type === "section" && <InfoBox color="purple" text="Visual divider. Use label as section heading." />}
                                    </>
                                )}

                                {propertyTab === "validation" && (
                                    <>
                                        {["text", "textarea", "email", "phone"].includes(selectedField.type) && (
                                            <>
                                                <PropSection title="Min Length">
                                                    <Input type="number" value={selectedField.minLength ?? ""} onChange={(e) => updateField(selectedField.id, { minLength: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="0" className="h-8 rounded-lg text-sm" />
                                                </PropSection>
                                                <PropSection title="Max Length">
                                                    <Input type="number" value={selectedField.maxLength ?? ""} onChange={(e) => updateField(selectedField.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="No limit" className="h-8 rounded-lg text-sm" />
                                                </PropSection>
                                            </>
                                        )}

                                        {selectedField.type === "number" && (
                                            <>
                                                <PropSection title="Minimum Value">
                                                    <Input type="number" value={selectedField.min ?? ""} onChange={(e) => updateField(selectedField.id, { min: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="No min" className="h-8 rounded-lg text-sm" />
                                                </PropSection>
                                                <PropSection title="Maximum Value">
                                                    <Input type="number" value={selectedField.max ?? ""} onChange={(e) => updateField(selectedField.id, { max: e.target.value ? Number(e.target.value) : undefined })}
                                                        placeholder="No max" className="h-8 rounded-lg text-sm" />
                                                </PropSection>
                                            </>
                                        )}

                                        <PropSection title="Custom Pattern">
                                            <Input value={selectedField.pattern || ""} onChange={(e) => updateField(selectedField.id, { pattern: e.target.value })}
                                                placeholder="Regex pattern..." className="h-8 rounded-lg text-sm font-mono" />
                                            <p className="text-[10px] text-slate-400 mt-1">Regular expression for custom validation</p>
                                        </PropSection>

                                        {["section", "image", "geotag"].includes(selectedField.type) && (
                                            <div className="text-center py-8">
                                                <ShieldCheck className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-xs text-slate-400 font-medium">No validation rules for this field type</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {propertyTab === "visibility" && (
                                    <>
                                        <PropSection title="Hidden">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-500">Hide from form view</span>
                                                <Switch checked={selectedField.hidden || false} onCheckedChange={(v: boolean) => updateField(selectedField.id, { hidden: v })} />
                                            </div>
                                        </PropSection>

                                        <PropSection title="Read Only">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-500">Prevent editing</span>
                                                <Switch checked={selectedField.readOnly || false} onCheckedChange={(v: boolean) => updateField(selectedField.id, { readOnly: v })} />
                                            </div>
                                        </PropSection>

                                        <PropSection title="Conditional Display">
                                            <p className="text-[10px] text-slate-400 mb-2">Show this field only when another field has a specific value</p>
                                            <Select value={selectedField.conditionalField || "none"} onValueChange={(v) => updateField(selectedField.id, { conditionalField: v === "none" ? undefined : v })}>
                                                <SelectTrigger className="h-8 rounded-lg text-sm mb-2">
                                                    <SelectValue placeholder="Depends on field..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg">
                                                    <SelectItem value="none">None</SelectItem>
                                                    {fields.filter(f => f.id !== selectedField.id && f.type !== "section").map(f => (
                                                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedField.conditionalField && (
                                                <Input value={selectedField.conditionalValue || ""} onChange={(e) => updateField(selectedField.id, { conditionalValue: e.target.value })}
                                                    placeholder="Expected value..." className="h-8 rounded-lg text-sm" />
                                            )}
                                        </PropSection>
                                    </>
                                )}

                                {propertyTab === "advanced" && (
                                    <>
                                        <PropSection title="Help Text">
                                            <Input value={selectedField.helpText || ""} onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                                                placeholder="Tooltip or instruction text..." className="h-8 rounded-lg text-sm" />
                                        </PropSection>

                                        <PropSection title="CSS Class">
                                            <Input value={selectedField.cssClass || ""} onChange={(e) => updateField(selectedField.id, { cssClass: e.target.value })}
                                                placeholder="custom-class" className="h-8 rounded-lg text-sm font-mono" />
                                            <p className="text-[10px] text-slate-400 mt-1">Additional styling class for mobile render</p>
                                        </PropSection>

                                        <PropSection title="Field ID">
                                            <code className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md block">{selectedField.id}</code>
                                        </PropSection>

                                        <PropSection title="Actions">
                                            <div className="space-y-2">
                                                <Button variant="outline" size="sm" className="w-full h-8 text-[11px] font-semibold rounded-lg"
                                                    onClick={() => duplicateField(selectedField.id)}>
                                                    <Copy className="w-3 h-3 mr-1.5" /> Duplicate Field
                                                </Button>
                                                <Button variant="outline" size="sm" className="w-full h-8 text-[11px] font-semibold rounded-lg text-red-500 border-red-200 hover:bg-red-50"
                                                    onClick={() => removeField(selectedField.id)}>
                                                    <Trash2 className="w-3 h-3 mr-1.5" /> Delete Field
                                                </Button>
                                            </div>
                                        </PropSection>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* No field selected — show form settings or instructions */
                        <div className="flex-1 flex flex-col">
                            <div className="p-3 border-b border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Properties</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                                    <Layers className="w-5 h-5 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400 mb-1">No field selected</p>
                                <p className="text-[11px] text-slate-300 leading-relaxed">Click a field on the canvas to inspect and configure its properties.</p>
                                <div className="mt-6 w-full space-y-2 text-left">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Shortcuts</p>
                                    <ShortcutHint keys="Ctrl + Z" desc="Undo" />
                                    <ShortcutHint keys="Ctrl + ⇧ + Z" desc="Redo" />
                                    <ShortcutHint keys="Del" desc="Delete field" />
                                    <ShortcutHint keys="Esc" desc="Deselect" />
                                </div>
                            </div>

                            {/* Form field list */}
                            {fields.length > 0 && (
                                <div className="border-t border-slate-100 p-3">
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">Field Order</p>
                                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                                        {fields.map((f, i) => {
                                            const M = getFieldMeta(f.type);
                                            return (
                                                <button key={f.id} onClick={() => setSelectedFieldId(f.id)}
                                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedFieldId === f.id ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-500"
                                                        }`}>
                                                    <span className="text-[10px] text-slate-300 font-mono w-4">{i + 1}</span>
                                                    <M.icon className="w-3 h-3 shrink-0" />
                                                    <span className="text-[11px] font-semibold truncate">{f.label}</span>
                                                    {f.required && <div className="w-1 h-1 bg-red-400 rounded-full shrink-0 ml-auto" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Version History Flyout ─────────────────────────────── */}
                {showVersions && (
                    <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-right-4 duration-200">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Version History</p>
                            <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)} className="h-6 w-6 p-0 rounded-md">
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {versions.map((v, i) => (
                                <div key={v.id} className={`p-3 rounded-xl border transition-all cursor-pointer ${i === 0 ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                    }`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-900">{i === 0 ? "Current" : `Version ${versions.length - i}`}</span>
                                        <Badge variant="outline" className={`text-[8px] font-bold px-1.5 py-0 rounded ${v.status === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-400"
                                            }`}>
                                            {v.status}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{v.timestamp.toLocaleDateString()} at {v.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-[10px] text-slate-300 mt-0.5">{v.fieldCount} fields</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function PropSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            {children}
        </div>
    );
}

function InfoBox({ color, text }: { color: "blue" | "amber" | "purple"; text: string }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return (
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${colors[color]}`}>
            <Check className="w-3.5 h-3.5 shrink-0" />
            <p className="text-[11px] font-medium">{text}</p>
        </div>
    );
}

function ShortcutHint({ keys, desc }: { keys: string; desc: string }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-[10px] text-slate-400">{desc}</span>
            <kbd className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{keys}</kbd>
        </div>
    );
}
