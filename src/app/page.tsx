"use client";

import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  Smartphone,
  ChevronRight,
  Check,
  Truck,
  HardHat,
  Activity,
  Layers,
  MousePointer2,
  Database,
  BarChart3,
  Eye,
  Lock,
  Radio,
  ScanLine,
  Network
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight italic">BLESH<span className="text-blue-600 NOT-italic">FORMS</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#capabilities" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#industries" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Industries</a>
            <a href="#platform" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Platform</a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 px-6">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold h-11 transition-all active:scale-[0.98]">Request Access</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60" />

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-full border border-blue-100 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Eye className="w-3 h-3" /> Field Operations Intelligence Platform
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-top-8 duration-700 delay-100">
            Operational visibility<br />
            <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-[10px]">at every coordinate.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-top-12 duration-700 delay-200">
            Geo-verified inspections. Compliance automation for distributed teams. The intelligence layer that turns field activity into operational certainty.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-top-16 duration-700 delay-300">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-2xl h-16 px-10 font-bold shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-[0.98]">
                Request a Demo <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="text-slate-600 text-lg rounded-2xl h-16 px-10 font-bold border-slate-200 hover:bg-slate-50">
              View Platform Overview
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="mt-24 pt-12 border-t border-slate-100 max-w-4xl mx-auto">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8">Trusted by operations teams across</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-xl font-black italic tracking-tighter opacity-70">DANGOTE GROUP</div>
              <div className="text-xl font-black italic tracking-tighter underline decoration-blue-600 decoration-4 underline-offset-4">TOTAL ENERGIES</div>
              <div className="text-xl font-black italic tracking-tighter opacity-70">MTN NIGERIA</div>
              <div className="text-xl font-black italic tracking-tighter opacity-70 font-sans">SHELL OPS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Strip */}
      <section className="py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { metric: "99.7%", label: "Geo-Verification Accuracy" },
              { metric: "< 200ms", label: "Real-Time Sync Latency" },
              { metric: "100%", label: "Offline-First Reliability" },
              { metric: "SOC 2", label: "Compliance Framework" },
            ].map((stat, i) => (
              <div key={i} className="text-center py-4">
                <div className="text-3xl font-black text-white mb-1">{stat.metric}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-32 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-blue-100 text-blue-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">Industries</Badge>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Purpose-built for <span className="text-blue-600">every terrain.</span></h2>
            <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">From oil rigs to last-mile delivery — complete operational control wherever your teams operate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: "Logistics & Supply Chain",
                desc: "Geo-verified proof of delivery. Route compliance audits. Chain-of-custody documentation with tamper-proof timestamps.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: HardHat,
                title: "Construction & Infrastructure",
                desc: "Site inspection workflows. HSE compliance tracking. Progress verification with geo-stamped photo evidence.",
                color: "bg-orange-50 text-orange-600"
              },
              {
                icon: Activity,
                title: "Healthcare & Life Sciences",
                desc: "Community health surveillance. Cold-chain monitoring. Field clinical data capture with offline resilience.",
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                icon: Globe,
                title: "Energy & Utilities",
                desc: "Pipeline inspection protocols. Asset condition monitoring. Regulatory compliance documentation at remote sites.",
                color: "bg-indigo-50 text-indigo-600"
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
                  <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Workflow Section */}
      <section id="capabilities" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">How It Works</Badge>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4 leading-[1.1]">From field activity to <span className="text-blue-600">operational certainty</span>.</h2>
              <p className="text-slate-500 font-medium mb-12 leading-relaxed">Four layers of intelligence that transform disconnected field work into a verified, auditable, and actionable operations record.</p>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Configure Inspection Protocols", desc: "Define structured data capture workflows — geo-fenced zones, required evidence types, compliance checklists, and chain-of-approval logic." },
                  { step: "02", title: "Deploy to Distributed Teams", desc: "Route assignments to field operatives based on proximity, clearance level, and operational urgency. Real-time status propagation across the command chain." },
                  { step: "03", title: "Capture with Verification", desc: "Every submission is geo-stamped, time-stamped, and device-verified. Photo evidence, sensor readings, and digital signatures — even without connectivity." },
                  { step: "04", title: "Surface Intelligence", desc: "Raw field data transforms into compliance dashboards, anomaly detection, trend analysis, and executive-ready operational reports." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="text-4xl font-black text-slate-100 group-hover:text-blue-100 transition-colors">{item.step}</div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-slate-900 rounded-[56px] p-8 aspect-square flex items-center justify-center overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 w-full border border-white/10 space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <ScanLine className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white/80">Pipeline Inspection #2847</div>
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Geo-Verified • 2 min ago</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 h-11 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-white/40 font-bold">Integrity Status</span>
                      <span className="text-xs text-emerald-400 font-black">PASS</span>
                    </div>
                    <div className="flex items-center justify-between px-4 h-11 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-white/40 font-bold">Corrosion Level</span>
                      <span className="text-xs text-amber-400 font-black">0.3mm</span>
                    </div>
                    <div className="flex items-center justify-between px-4 h-11 bg-blue-600/20 rounded-2xl border border-blue-600/20">
                      <span className="text-xs text-blue-300 font-bold">GPS Confidence</span>
                      <span className="text-xs text-blue-300 font-black">±0.8m</span>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-white/30 font-bold">Compliance verified</span>
                    </div>
                    <div className="h-10 w-28 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center text-xs font-bold text-white">Submit Report</div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/30 rounded-full blur-[80px]" />
                <div className="absolute top-20 right-20 h-10 w-10 bg-blue-600 rounded-lg rotate-12 animate-bounce shadow-2xl flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Section */}
      <section id="platform" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20 text-white">
            <div className="max-w-xl">
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">Platform Architecture</Badge>
              <h2 className="text-4xl font-black tracking-tight leading-tight mb-4">Engineered for <span className="text-blue-500">zero-trust</span> environments.</h2>
              <p className="text-slate-400 font-medium leading-relaxed">Every component built for intermittent connectivity, hostile conditions, and regulatory scrutiny.</p>
            </div>
            <Link href="#" className="flex items-center gap-2 text-blue-400 font-bold group hover:text-white transition-colors">
              Read technical whitepaper <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Geo-Verification Engine", desc: "Sub-meter GPS capture with anti-spoofing. Every data point anchored to a verified physical location with confidence scoring." },
              { icon: Smartphone, title: "Offline-First Architecture", desc: "Full operational capability without network. Local-first data persistence with automatic conflict resolution on reconnect." },
              { icon: Lock, title: "Tenant-Isolated Security", desc: "Hardened multi-tenant boundaries. Row-level security, workspace encryption, and complete data sovereignty per organization." },
              { icon: BarChart3, title: "Operational Analytics", desc: "Real-time compliance dashboards. Trend detection, SLA tracking, anomaly alerts, and geo-spatial performance heatmaps." },
              { icon: Network, title: "Integration Hub", desc: "Connect field intelligence to your existing stack. Low-latency webhooks, REST APIs, and direct database synchronization." },
              { icon: MousePointer2, title: "No-Code Protocol Builder", desc: "Operations managers configure inspection workflows without engineering. Conditional logic, approval chains, and evidence requirements." },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-10 rounded-[40px] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-300">
                <f.icon className="w-8 h-8 text-blue-400 mb-8" />
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-blue-100 text-blue-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">Pricing</Badge>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Operational capacity, <span className="text-blue-600">priced fairly.</span></h2>
            <p className="text-slate-500 font-medium mt-4 max-w-xl mx-auto">Transparent pricing that scales with your field operations. No per-seat surprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Operations Starter</h3>
              <p className="text-slate-400 font-bold text-sm mb-6">Pilot your first field deployment</p>
              <div className="text-5xl font-black text-slate-900 mb-1">$0<span className="text-xl text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-400 mb-10 font-bold">FREE FOREVER</p>
              <div className="w-full h-px bg-slate-50 mb-10" />
              <ul className="space-y-4 mb-12 text-left w-full">
                {["1 Operations Workspace", "100 Verified Submissions / mo", "Core Inspection Protocols", "Standard Geo-Intelligence", "Community Support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <Check className="w-4 h-4 text-blue-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full mt-auto">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">Start Pilot</Button>
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-slate-900 p-10 rounded-[48px] border-4 border-blue-600 shadow-2xl relative flex flex-col items-center text-center">
              <div className="absolute -top-5 bg-blue-600 text-white px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">Recommended</div>
              <h3 className="text-2xl font-black text-white mb-2">Operations Pro</h3>
              <p className="text-white/40 font-bold text-sm mb-6">Scale distributed field teams</p>
              <div className="text-5xl font-black text-white mb-1">$29<span className="text-xl text-white/40">/mo</span></div>
              <p className="text-xs text-white/40 mb-10 font-bold">PER WORKSPACE</p>
              <div className="w-full h-px bg-white/10 mb-10" />
              <ul className="space-y-4 mb-12 text-left w-full text-white/80">
                {["5 Operations Workspaces", "5,000 Verified Submissions / mo", "Dispatch & Assignment Engine", "Priority Webhook Integrations", "Offline-First Field Capture", "Dedicated Email Support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    <Check className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full mt-auto">
                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-900/50">Deploy Operations Pro</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-400 font-bold text-sm mb-6">Global-scale operations control</p>
              <div className="text-5xl font-black text-slate-900 mb-1">Custom</div>
              <p className="text-xs text-slate-400 mb-10 font-bold">VOLUME LICENSING</p>
              <div className="w-full h-px bg-slate-50 mb-10" />
              <ul className="space-y-4 mb-12 text-left w-full">
                {["Unlimited Submissions", "Dedicated Geo-Intelligence Engine", "SAML SSO & Role-Based Access", "White-Label Deployment", "24/7 Priority SLA Support", "Direct Database Synchronization"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <Check className="w-4 h-4 text-blue-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="#" className="w-full mt-auto">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Common questions from operations leaders</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: "How does geo-verification prevent data fabrication?", a: "Every submission is anchored to device-level GPS with anti-spoofing detection. We cross-reference coordinates against assigned geo-zones and flag anomalies in real-time. Confidence scores and satellite lock metadata are attached to every record for audit trails." },
              { q: "Can BLESH operate in regions with zero connectivity?", a: "Yes. The platform is offline-first by design. Field operatives capture data, photos, and signatures with full functionality — everything persists on-device and synchronizes automatically with conflict resolution when connectivity returns." },
              { q: "How is data isolated between organizations?", a: "Every workspace operates in a fully isolated tenant boundary. Row-level security, workspace-scoped encryption, and strict API boundaries ensure zero data leakage between organizations. Enterprise customers can additionally select deployment regions for data residency compliance." },
              { q: "What compliance frameworks does BLESH support?", a: "The platform is designed to support GDPR, POPIA, and industry-specific regulatory requirements. Audit logs, tamper-proof timestamps, and chain-of-custody documentation are built into every workflow." },
            ].map((faq, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h4 className="font-black text-lg text-slate-900 mb-3">{faq.q}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-slate-900 rounded-[56px] p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="relative z-10">
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-8">Transform Your Operations</Badge>
              <h2 className="text-5xl font-black tracking-tight mb-8">Stop managing field teams <br />in the dark.</h2>
              <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                Operational blind spots cost enterprises millions in compliance failures, rework, and missed SLAs. BLESH gives you verified intelligence from every field interaction.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 text-lg rounded-2xl h-16 px-12 font-bold transition-all active:scale-[0.98]">
                    Request a Demo
                  </Button>
                </Link>
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg rounded-2xl h-16 px-10 font-bold">
                  Read Case Studies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight italic">BLESH<span className="text-blue-600 NOT-italic">FORMS</span></span>
          </div>
          <div className="flex items-center gap-10">
            {["Terms", "Privacy", "Security", "Compliance", "Contact"].map(item => (
              <Link key={item} href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">{item}</Link>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 BLESH TECHNOLOGIES LTD</p>
        </div>
      </footer>
    </div>
  );
}
