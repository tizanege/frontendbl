"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Submission {
    id: string;
    location?: { lat: number; lng: number };
    data: any;
    submitted_at: string;
}

interface FieldMapProps {
    submissions: Submission[];
    center?: [number, number];
    zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function FieldMap({ submissions, center = [0, 0], zoom = 2 }: FieldMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-slate-50 animate-pulse rounded-[40px]" />;

    // Filter out submissions without location
    const geoSubmissions = submissions.filter(s => s.location && s.location.lat && s.location.lng);

    return (
        <div className="h-full w-full rounded-[40px] overflow-hidden shadow-inner border border-slate-100">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} zoom={zoom} />
                {geoSubmissions.map((sub) => (
                    <Marker
                        key={sub.id}
                        position={[sub.location!.lat, sub.location!.lng]}
                    >
                        <Popup className="rounded-2xl">
                            <div className="p-2">
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Submission #{sub.id.substring(0, 8)}</p>
                                <p className="text-xs font-bold text-slate-900 mb-2">{new Date(sub.submitted_at).toLocaleString()}</p>
                                <div className="bg-slate-50 p-2 rounded-lg">
                                    {Object.entries(sub.data).slice(0, 2).map(([key, val]: [string, any]) => (
                                        <p key={key} className="text-[10px] text-slate-500 font-medium">
                                            <span className="font-bold text-slate-700">{key}:</span> {String(val)}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
