import { useState, useEffect, useCallback } from "react";
import { Bot, Database, Mail, HardDrive, Shield, Activity, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Status = "operational" | "degraded" | "down";

interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  status: Status;
  note?: string;
}

interface Incident { id: string; title: string; service: string; start: string; end: string | null; }

const ICON_MAP: Record<string, React.ElementType> = {
  Database,
  "API Server": Activity,
  Email: Mail,
  "AI Grading / Chat": Bot,
  "File Storage": HardDrive,
  Authentication: Shield,
};

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
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overall, setOverall] = useState<Status>("operational");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.admin.health();
      const d: any = res.data || {};
      setOverall((d.overall as Status) || "operational");
      setLastChecked(d.checkedAt ? new Date(d.checkedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : getTime());
      const checks = Array.isArray(d.services) ? d.services : [];
      setServices(
        checks.map((c: any, i: number) => ({
          id: String(c.name || i),
          name: c.name || "Service",
          icon: ICON_MAP[c.name] || Activity,
          status: (c.status as Status) || "operational",
          note: c.detail || (c.latencyMs != null ? `${c.latencyMs}ms` : undefined),
        }))
      );
      setIncidents(
        (Array.isArray(d.incidents) ? d.incidents : []).map((inc: any, i: number) => ({
          id: String(inc.id || i),
          title: inc.title || "Incident",
          service: inc.service || "—",
          start: inc.start || inc.startedAt || "",
          end: inc.end || inc.resolvedAt || null,
        }))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load health status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      setLastChecked(getTime());
      load();
    }, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const degraded = services.filter(s => s.status !== "operational").length;
  const anyDown = overall === "down" || services.some(s => s.status === "down");

  return (
    <AppShell role="admin" pageTitle="Platform Status">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#64748B]">Last checked: {lastChecked}</p>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] text-[#272757] rounded-xl text-sm font-semibold hover:bg-[#F8FAFC] transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#8686AC] gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Checking status…
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {services.map(svc => (
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

          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#0F0E47]">Recent Incidents</h2>
              <p className="text-xs text-[#8686AC]">Last 30 days</p>
            </div>
            {incidents.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
                <p className="font-semibold text-[#0F0E47]">No incidents in the past 30 days</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {incidents.map(inc => (
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
        </>
      )}
    </AppShell>
  );
}
