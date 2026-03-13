"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Layers,
    Map as MapIcon,
    Maximize2,
    Filter,
    Download,
    Search,
    Loader2,
    ChevronRight,
    MousePointer2,
    Calendar,
    Users,
    Satellite,
    Route,
    Info,
    X,
    Settings2,
    Activity,
    Box,
    Clock,
    CircleDashed,
    Moon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// --- CSS Imports ---
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// --- Dynamic Component Imports for Leaflet ---
// Wrapping them to ensure they Only run on client and don't interfere with React 19's hydration
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false });
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), { ssr: false });

// --- Spatial Helper Components ---

/**
 * Ensures Density Heatmaps render correctly by bridging the Leaflet global instance.
 */
const HeatmapLayer = ({ points, map, gradient }: { points: [number, number, number][], map: any, gradient: any }) => {
    useEffect(() => {
        if (!map || !points || points.length === 0) return;

        let heatLayer: any;
        let active = true;

        const initHeat = async () => {
            try {
                const LeafletModule = await import("leaflet");
                const L = (LeafletModule as any).default || LeafletModule;

                // Polyfill global L for the plugin
                if (typeof window !== "undefined") { (window as any).L = L; }

                await import("leaflet.heat");

                if (!active || !map) return;

                const LGlobal = (window as any).L;
                if (LGlobal && LGlobal.heatLayer) {
                    heatLayer = LGlobal.heatLayer(points, {
                        radius: 25,
                        blur: 15,
                        maxZoom: 17,
                        gradient: gradient || { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
                    }).addTo(map);
                }
            } catch (err) {
                console.error("Spatial Engine: Heatmap failed to mount", err);
            }
        };

        initHeat();

        return () => {
            active = false;
            if (heatLayer && map) {
                try { map.removeLayer(heatLayer); } catch (e) { /* silent cleanup */ }
            }
        };
    }, [map, points, gradient]);

    return null;
};

/**
 * Safely extracts the Leaflet map instance within the MapContainer context.
 */
const MapBridge = ({ onMapReady }: { onMapReady: (map: any) => void }) => {
    const [mapHook, setMapHook] = useState<any>(null);

    useEffect(() => {
        import("react-leaflet").then(mod => setMapHook(() => mod.useMap));
    }, []);

    if (!mapHook) return null;

    return <MapHookConsumer hook={mapHook} onReady={onMapReady} />;
};

const MapHookConsumer = ({ hook, onReady }: { hook: any, onReady: (map: any) => void }) => {
    const map = hook();
    useEffect(() => {
        if (map) onReady(map);
    }, [map, onReady]);
    return null;
};

// --- Sub-components for Stability ---

const Sidebar = memo(({
    show,
    onClose,
    searchQuery,
    setSearchQuery,
    submissions,
    selectedId,
    onSelect
}: any) => {
    if (!show) return null;

    return (
        <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-[32px] z-[1000] flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="p-6 border-b border-slate-50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spatial Intel</span>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                        <X className="w-4 h-4 text-slate-400" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                        placeholder="Filter nodes..."
                        className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {submissions.length > 0 ? (
                    submissions.map((sub: any) => (
                        <button
                            key={sub.id}
                            onClick={() => onSelect(sub)}
                            className={`w-full text-left p-4 rounded-[24px] transition-all border ${selectedId === sub.id
                                ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]"
                                : "bg-white border-slate-100 hover:border-slate-300 text-slate-900"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Badge className={`text-[9px] font-black font-mono tracking-tighter ${selectedId === sub.id ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400"}`}>
                                    {sub.id.substring(0, 8)}
                                </Badge>
                                <span className={`text-[9px] font-bold ${selectedId === sub.id ? "text-slate-400" : "text-slate-300"}`}>
                                    {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className={`text-sm font-black truncate ${selectedId === sub.id ? "text-white" : "text-slate-900"}`}>
                                {Object.values(sub.data)[0]?.toString() || "Entry Data"}
                            </p>
                            <div className="flex items-center gap-3 mt-3 text-[10px] font-bold opacity-60">
                                <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> {sub.location.lat.toFixed(3)}, {sub.location.lng.toFixed(3)}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-20 text-center opacity-40">
                        <Info className="w-10 h-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Nodes Found</p>
                    </div>
                )}
            </div>
        </div>
    );
});

Sidebar.displayName = "SpatialSidebar";

// --- Main Engine Page ---

export default function GeospatialMapPage() {
    const { id } = useParams();
    const router = useRouter();

    // States
    const [form, setForm] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [mapType, setMapType] = useState<any>("streets");
    const [vizMode, setVizMode] = useState<"standard" | "cluster" | "heatmap">("standard");
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSidebar, setShowSidebar] = useState(true);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [heatmapColor, setHeatmapColor] = useState<"classic" | "thermal" | "crimson">("classic");
    const [playbackProgress, setPlaybackProgress] = useState(100);
    const [proximityMode, setProximityMode] = useState<{ active: boolean; center: [number, number] | null; radius: number }>({ active: false, center: null, radius: 1000 });

    const heatmapGradients = {
        classic: { 0.4: 'rgba(255, 255, 0, 0.5)', 0.7: 'rgba(255, 128, 0, 0.8)', 1: 'rgba(255, 0, 0, 1)' },
        thermal: { 0.4: '#00d2ff', 0.7: '#92fe9d', 1: '#ff512f' },
        crimson: { 0.2: 'rgba(255,255,255,0)', 0.5: 'rgba(255,0,0,0.5)', 1: 'rgba(150,0,0,1)' }
    };

    // Unified Initial Load Logic
    useEffect(() => {
        let isCancelled = false;

        const initEngine = async () => {
            setMounted(true);
            try {
                // 1. Prep Leaflet Environment
                const L = (await import("leaflet")).default;
                const DefaultIcon = L.icon({
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                });
                L.Marker.prototype.options.icon = DefaultIcon;
                if (typeof window !== "undefined") { (window as any).L = L; }

                if (isCancelled) return;

                // 2. Fetch Spatial Data
                const [formRes, subRes] = await Promise.all([
                    api.get(`/forms/${id}`),
                    api.get(`/forms/${id}/submissions`)
                ]);

                if (isCancelled) return;

                setForm(formRes.data);
                setSubmissions(subRes.data.filter((s: any) => s.location?.lat && s.location?.lng));
            } catch (err) {
                console.error("Spatial Engine Boot Error:", err);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        if (id) initEngine();
        return () => { isCancelled = true; };
    }, [id]);

    // Auto-pan to selected node
    useEffect(() => {
        if (mapInstance && selectedSub?.location) {
            mapInstance.flyTo(
                [selectedSub.location.lat, selectedSub.location.lng],
                15,
                { duration: 1.5, easeLinearity: 0.25 }
            );
        }
    }, [selectedSub, mapInstance]);

    // Computed Logic
    const tileUrls: any = {
        streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    };

    const sortedSubmissions = useMemo(() => {
        return [...submissions].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
    }, [submissions]);

    const filtered = useMemo(() => {
        // 1. Time Filter
        const count = Math.ceil((playbackProgress / 100) * sortedSubmissions.length);
        let current = sortedSubmissions.slice(0, count);

        // 2. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            current = current.filter(s =>
                JSON.stringify(s.data).toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q)
            );
        }

        return current;
    }, [sortedSubmissions, searchQuery, playbackProgress]);

    const initialCenter = useMemo<[number, number]>(() => {
        if (submissions.length > 0) {
            return [submissions[0].location.lat, submissions[0].location.lng];
        }
        return [9.0820, 8.6753];
    }, [submissions]);

    // Handlers
    const onExport = () => {
        const data = {
            type: "FeatureCollection",
            features: filtered.map(s => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [s.location.lng, s.location.lat] },
                properties: { id: s.id, time: s.submitted_at, ...s.data }
            }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${form?.name || "spatial"}_nodes.json`;
        link.click();
    };

    // Rendering Stages
    if (!mounted || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Booting Spatial Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="h-screen flex flex-col bg-white overflow-hidden selection:bg-blue-100">
                {/* --- Control Center Header --- */}
                <header className="h-16 px-6 border-b border-slate-100 flex items-center justify-between z-50 bg-white/90 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${id}`)} className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-100 group">
                            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{form?.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase bg-blue-50 text-blue-700 border-none px-2">v2.1 Stable</Badge>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Activity className="w-2.5 h-2.5" /> {filtered.length} Nodes Online
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/forms/${id}/edit`}>
                            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 font-bold gap-2">
                                <Settings2 className="w-4 h-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={onExport} className="h-10 px-4 rounded-xl border-slate-200 font-bold gap-2">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden relative bg-slate-50">
                    <Sidebar
                        show={showSidebar}
                        onClose={() => setShowSidebar(false)}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        submissions={filtered}
                        selectedId={selectedSub?.id}
                        onSelect={setSelectedSub}
                    />

                    {!showSidebar && (
                        <Button
                            onClick={() => setShowSidebar(true)}
                            className="absolute left-6 top-6 h-14 w-14 rounded-3xl bg-white shadow-2xl z-[1000] border border-slate-200 hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center text-slate-900"
                        >
                            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                    )}

                    {/* --- Deep Spatial Engine --- */}
                    <div className="flex-1 h-full w-full relative bg-slate-100">
                        {submissions.length >= 0 && (
                            <MapContainer
                                center={initialCenter}
                                zoom={13}
                                zoomControl={false}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    key={mapType}
                                    attribution="© OpenStreetMap"
                                    url={tileUrls[mapType]}
                                />
                                <ZoomControl position="bottomright" />

                                <MapBridge onMapReady={setMapInstance} />

                                {vizMode === "heatmap" && mapInstance && (
                                    <HeatmapLayer
                                        map={mapInstance}
                                        points={filtered.map(s => [s.location.lat, s.location.lng, 1]) as [number, number, number][]}
                                        gradient={heatmapGradients[heatmapColor]}
                                    />
                                )}

                                {vizMode === "cluster" && (
                                    <MarkerClusterGroup chunkedLoading>
                                        {filtered.map((sub) => (
                                            <StaticMarker key={sub.id} sub={sub} onClick={() => { setSelectedSub(sub); setShowSidebar(true); }} />
                                        ))}
                                    </MarkerClusterGroup>
                                )}

                                {vizMode === "standard" && filtered.map((sub) => (
                                    <StaticMarker key={sub.id} sub={sub} onClick={() => { setSelectedSub(sub); setShowSidebar(true); }} />
                                ))}

                                {proximityMode.active && proximityMode.center && (
                                    // Circular Buffer Analytics
                                    <CircleBridge center={proximityMode.center} radius={proximityMode.radius} />
                                )}
                            </MapContainer>
                        )}

                        {/* --- Proximity Interaction Layer --- */}
                        {proximityMode.active && (
                            <div
                                className="absolute inset-0 z-[1001] cursor-crosshair"
                                onClick={(e) => {
                                    if (!mapInstance) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    const latlng = mapInstance.containerPointToLatLng([x, y]);
                                    setProximityMode(prev => ({ ...prev, center: [latlng.lat, latlng.lng] }));
                                }}
                            />
                        )}

                        {/* --- Temporal Playback UI --- */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-20 bg-white/95 backdrop-blur-md rounded-[32px] border border-slate-200 shadow-2xl z-[1002] flex flex-col p-6 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Temporal Playback
                                </span>
                                <span className="text-[10px] font-black text-blue-600">
                                    {filtered.length} / {submissions.length} Nodes
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={playbackProgress}
                                onChange={(e) => setPlaybackProgress(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Layer Toggles */}
                        <div className="absolute right-6 top-6 flex flex-col gap-3 z-[1000]">
                            {/* Viz Mode Toggles */}
                            <Card className="rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden p-1.5 flex flex-col gap-1 border border-white/20">
                                {[
                                    { mode: "standard", icon: MousePointer2 },
                                    { mode: "cluster", icon: Box },
                                    { mode: "heatmap", icon: Activity },
                                    { mode: "proximity", icon: CircleDashed }
                                ].map(({ mode, icon: Icon }) => (
                                    <Button
                                        key={mode}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (mode === 'proximity') {
                                                setProximityMode(prev => ({ ...prev, active: !prev.active, center: null }));
                                            } else {
                                                setVizMode(mode as any);
                                            }
                                        }}
                                        className={`h-11 w-11 p-0 rounded-2xl transition-all ${(mode === 'proximity' ? proximityMode.active : vizMode === mode)
                                            ? (mode === 'heatmap' ? "bg-red-600 text-white shadow-xl scale-110" : "bg-blue-600 text-white shadow-xl scale-110")
                                            : "hover:bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </Button>
                                ))}
                            </Card>

                            {/* Heatmap Color Selector (Only if heatmap active) */}
                            {vizMode === "heatmap" && (
                                <Card className="rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden p-1.5 flex flex-col gap-1 border border-white/20 animate-in slide-in-from-right-2">
                                    {[
                                        { id: "classic", color: "bg-red-500" },
                                        { id: "thermal", color: "bg-cyan-400" },
                                        { id: "crimson", color: "bg-red-900" }
                                    ].map(({ id, color }) => (
                                        <Button
                                            key={id}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setHeatmapColor(id as any)}
                                            className={`h-11 w-11 p-0 rounded-2xl transition-all border-2 ${heatmapColor === id ? "border-red-600 scale-110" : "border-transparent text-slate-500"}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full ${color} shadow-sm`} />
                                        </Button>
                                    ))}
                                </Card>
                            )}

                            <Card className="rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden p-1.5 flex flex-col gap-1 border border-white/20">
                                {(["streets", "satellite", "light", "dark"] as const).map(type => (
                                    <Button
                                        key={type}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setMapType(type as any)}
                                        className={`h-11 w-11 p-0 rounded-2xl transition-all ${mapType === type ? (type === 'dark' ? "bg-black text-white" : "bg-slate-900 text-white shadow-lg") : "hover:bg-slate-100 text-slate-500"}`}
                                    >
                                        {type === 'dark' ? <Moon className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                                    </Button>
                                ))}
                                <Separator className="my-1 mx-2 bg-slate-100" />
                                <Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-2xl hover:bg-slate-100 text-slate-500"><Maximize2 className="w-5 h-5" /></Button>
                            </Card>
                        </div>
                    </div>

                    {/* --- Deep Insight Panel --- */}
                    {selectedSub && (
                        <div className="absolute right-8 bottom-8 w-80 bg-slate-900 text-white rounded-[40px] shadow-2xl z-[1001] transition-all animate-in slide-in-from-bottom-12 duration-700 overflow-hidden border border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)]">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 shrink-0">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black tracking-tight leading-none mb-1">Node Analytics</h3>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] truncate">{selectedSub.id.substring(0, 16)}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedSub(null)} className="h-10 w-10 p-0 rounded-xl hover:bg-white/10 text-white/40">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/[0.03] p-4 rounded-[24px] border border-white/[0.05]">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-500">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Logged</span>
                                        </div>
                                        <p className="text-[10px] font-bold">{new Date(selectedSub.submitted_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-white/[0.03] p-4 rounded-[24px] border border-white/[0.05]">
                                        <div className="flex items-center gap-2 mb-1.5 text-slate-500">
                                            <Users className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Token</span>
                                        </div>
                                        <p className="text-[10px] font-bold truncate">A-{selectedSub.captured_by_user_id?.substring(0, 6) || "AUTO"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[240px] overflow-y-auto pr-4 custom-scrollbar scrollbar-white">
                                    {Object.entries(selectedSub.data).map(([key, val]: [string, any]) => (
                                        <div key={key} className="group transition-all">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{key}</p>
                                            <div className="text-[11px] font-medium text-slate-300 bg-white/[0.02] p-4 rounded-[20px] border border-white/[0.03] group-hover:border-white/10 transition-all group-hover:bg-white/[0.04] leading-relaxed">
                                                {String(val)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                                    <Button className="flex-1 bg-white hover:bg-slate-100 text-slate-900 rounded-[20px] font-black text-[10px] h-12 shadow-2xl active:scale-95 transition-all uppercase tracking-widest">
                                        Report
                                    </Button>
                                    <Button variant="outline" className="h-12 w-12 rounded-[20px] border-white/10 bg-transparent text-white p-0 hover:bg-white/5 active:scale-95 transition-all">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}

// --- Proximity Infrastructure ---

const CircleBridge = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

// Dedicated static sub-component for markers to prevent DOM interference
function StaticMarker({ sub, onClick }: { sub: any, onClick: () => void }) {
    return (
        <Marker
            position={[sub.location.lat, sub.location.lng]}
            draggable={true}
            eventHandlers={{
                click: onClick,
                dragend: (e) => {
                    const position = e.target.getLatLng();
                    console.log(`Node ${sub.id} repositioned:`, position);
                }
            }}
        >
            <Popup className="custom-popup rounded-[40px]">
                <div className="p-5 min-w-[260px]">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-[20px] bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/30">
                            #{sub.id.substring(0, 3)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Intelligence</p>
                            <p className="text-xs font-black text-slate-900">{sub.id.substring(0, 16)}</p>
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-5 rounded-[28px] border border-slate-100">
                        {Object.entries(sub.data).slice(0, 2).map(([key, val]: [string, any]) => (
                            <div key={key}>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{key}</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{String(val)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost" onClick={onClick} className="h-9 text-[10px] font-black text-blue-600 hover:bg-blue-50 px-4 rounded-xl uppercase tracking-widest">Detail</Button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
