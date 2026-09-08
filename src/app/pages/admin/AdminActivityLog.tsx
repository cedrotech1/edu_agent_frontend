import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

interface ActivityRow {
  id: string;
  ts: string;
  type: string;
  message: string;
  result: string;
}

const TYPE_BADGE: Record<string, string> = {
  submission: "bg-[#D1FAE5] text-[#065F46]",
  quiz: "bg-[#EDE9FE] text-[#272757]",
  default: "bg-[#FEF3C7] text-[#92400E]",
};

const ITEMS_PER_PAGE = 20;

function formatTs(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminActivityLog() {
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [appliedType, setAppliedType] = useState("All");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.activity();
        const rows = (res.data as any[]) || [];
        setLogs(
          (Array.isArray(rows) ? rows : []).map((r: any, i: number) => ({
            id: `${r.type || "event"}-${r.meta?.quizId || r.meta?.submissionId || i}-${r.at || i}`,
            ts: formatTs(r.at),
            type: r.type || "event",
            message: r.message || "Activity",
            result: "Success",
          })),
        );
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load activity");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function applyFilters() {
    setAppliedType(filterType);
    setAppliedSearch(search);
    setPage(1);
  }

  const filteredLogs = logs.filter((log) => {
    if (appliedType !== "All" && log.type !== appliedType) return false;
    if (appliedSearch && !log.message.toLowerCase().includes(appliedSearch.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const start = filteredLogs.length ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const end = Math.min(page * ITEMS_PER_PAGE, filteredLogs.length);
  const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const inputCls = "h-9 border border-[#E2E8F0] rounded-lg px-2 text-sm focus:outline-none focus:border-[#272757] bg-white text-[#0F0E47]";

  return (
    <AppShell role="admin" pageTitle="Activity Log">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Type</label>
            <select
              className={inputCls + " cursor-pointer"}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>All</option>
              <option value="submission">submission</option>
              <option value="quiz">quiz</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Search</label>
            <input
              className={inputCls + " px-3 min-w-[220px]"}
              placeholder="Search activity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={applyFilters}
            className="h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-semibold hover:bg-[#1A1952]"
          >
            Apply
          </button>
          <button
            onClick={() => {
              const rows = filteredLogs.length ? filteredLogs : [];
              if (!rows.length) {
                toast.error("Nothing to export");
                return;
              }
              const header = "Time,Type,Message,Result\n";
              const body = rows
                .map(
                  (log) =>
                    `"${String(log.ts).replace(/"/g, '""')}","${log.type}","${String(log.message).replace(/"/g, '""')}","${log.result}"`
                )
                .join("\n");
              const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "activity-log.csv";
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Activity CSV downloaded");
            }}
            className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#0F0E47] hover:bg-[#F8FAFC] inline-flex items-center gap-1.5 ml-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p className="text-sm">Loading activity…</p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No activity found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, i) => (
                  <tr key={log.id} className={i % 2 === 1 ? "bg-gray-50/50" : ""}>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{log.ts}</td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          TYPE_BADGE[log.type] || TYPE_BADGE.default
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="text-sm text-[#0F0E47]">{log.message}</td>
                    <td>
                      <span className="text-xs font-semibold text-[#10B981]">{log.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredLogs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] text-xs text-gray-500">
            <span>
              Showing {start}–{end} of {filteredLogs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
