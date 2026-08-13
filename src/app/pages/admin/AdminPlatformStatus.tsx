import { useState, useEffect } from "react";
import { Bot, Bell, Database, Mail, HardDrive, Shield, Activity, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";

type Status = "operational" | "degraded" | "down";

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  status: Status;
  note?: string;
}

const SERVICES: Service[] = [
  { id: "ai",    name: "AI Grading Engine",    icon: Bot,      status: "operational" },
  { id: "db",    name: "Database",             icon: Database, status: "operational" },
  { id: "email", name: "Email Service",        icon: Mail,     status: "degraded" },
  { id: "fs",    name: "File Storage",         icon: HardDrive,status: "operational" },
  { id: "auth",  name: "Authentication Service",icon: Shield,  status: "operational" },
  { id: "api",   name: "API Response Time",    icon: Activity, status: "degraded", note: "avg 2.4s" },
];

interface Incident { id: string; title: string; service: string; start: string; end: string | null; }

const INCIDENTS: Incident[] = [
  { id: "1", title: "Email Delivery Delays",    service: "Email Service", start: "Aug 3, 2026 10:15", end: null },
  { id: "2", title: "Database Maintenance",     service: "Database",      start: "Jul 28, 2026 02:00", end: "Jul 28, 2026 04:30" },
];

function statusBadge(s: Status) {
  if (s === "operational") return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">Operational</span>;
  if (s === "degraded")    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">Degraded</span>;
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">Down</span>;
}

function getTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AdminPlatformStatus() {
  const [lastChecked, setLastChecked] = useState(getTime());
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setLastChecked(getTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const degraded = SERVICES.filter(s => s.status !== "operational").length;
  const allOk = degraded === 0;
  const anyDown = SERVICES.some(s => s.status === "down");

  return (
    <AppShell role="admin" pending={true} pageTitle="Platform Status">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={() => setSubscribeModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors">
          <Bell className="w-4 h-4" /> Subscribe to Updates
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl mb-6 border-l-4 ${
        anyDown ? "bg-[#FEE2E2] border-[#EF4444]" : degraded > 0 ? "bg-[#FEF3C7] border-[#F59E0B]" : "bg-[#D1FAE5] border-[#10B981]"
      }`}>
        {anyDown ? <AlertTriangle className="w-5 h-5 text-[#EF4444]" /> : degraded > 0 ? <AlertTriangle className="w-5 h-5 text-[#F59E0B]" /> : <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
        <div>
          <p className={`font-bold text-sm ${anyDown ? "text-[#991B1B]" : degraded > 0 ? "text-[#92400E]" : "text-[#065F46]"}`}>
            {anyDown ? "Service disruption detected" : degraded > 0 ? "Some systems experiencing issues" : "All systems operational"}
          </p>
          <p className={`text-xs mt-0.5 ${anyDown ? "text-[#B91C1C]" : degraded > 0 ? "text-[#B45309]" : "text-[#059669]"}`}>
            Last checked: {lastChecked} · Updates every 60s
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SERVICES.map(svc => (
          <div key={svc.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
                  <svc.icon className="w-4.5 h-4.5 text-[#272757]" style={{ strokeWidth: 1.75 }} />
                </div>
                <div>
                  <p className="font-semibold text-[#0F0E47] text-sm">{svc.name}</p>
                  {svc.note && <p className="text-[11px] text-[#8686AC]">{svc.note}</p>}
                </div>
              </div>
              {statusBadge(svc.status)}
            </div>
            <p className="text-[11px] text-[#94A3B8]">Last checked: {lastChecked}</p>
          </div>
        ))}
      </div>

      {/* Recent Incidents */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F0E47]">Recent Incidents</h2>
          <p className="text-xs text-[#8686AC]">Last 30 days</p>
        </div>
        {INCIDENTS.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
            <p className="font-semibold text-[#0F0E47]">No incidents in the past 30 days</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {INCIDENTS.map(inc => (
              <div key={inc.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0F0E47] text-sm">{inc.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Affected: {inc.service}</p>
                  <p className="text-xs text-[#8686AC] mt-0.5">Started: {inc.start}</p>
                  {inc.end && <p className="text-xs text-[#8686AC]">Resolved: {inc.end}</p>}
                </div>
                {inc.end
                  ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46] flex-shrink-0">Resolved</span>
                  : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] flex-shrink-0">Ongoing</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {subscribeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F0E47]">Subscribe to Status Updates</h3>
              <button onClick={() => setSubscribeModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-sm text-[#64748B] mb-4">Receive automatic email alerts when a service goes down or recovers.</p>
            <label className="block text-sm text-[#64748B] mb-1.5">Email Address</label>
            <input type="email" value={subscribeEmail} onChange={e => setSubscribeEmail(e.target.value)} placeholder="admin@quizmind.ai"
              className="w-full h-10 border border-[#E2E8F0] rounded-xl px-3 text-sm focus:outline-none focus:border-[#272757] mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setSubscribeModal(false)} className="flex-1 border border-[#E2E8F0] rounded-xl h-10 text-sm text-[#64748B] hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { toast.success("Subscribed! You'll receive status alerts at " + subscribeEmail); setSubscribeModal(false); setSubscribeEmail(""); }}
                className="flex-1 bg-[#272757] text-white rounded-xl h-10 text-sm font-semibold hover:bg-[#1A1952] transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
