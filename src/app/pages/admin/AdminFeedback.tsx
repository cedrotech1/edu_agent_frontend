import { useCallback, useEffect, useState } from "react";
import { Loader2, Star, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../../components/AppShell";
import { api, ApiError } from "@/lib/api";

type FeedbackRow = {
  id: number;
  rating: number;
  message: string;
  category: string;
  status: "new" | "reviewed";
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    school?: string | null;
  } | null;
};

type Stats = {
  total: number;
  newCount: number;
  reviewedCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const emptyStats: Stats = {
  total: 0,
  newCount: 0,
  reviewedCount: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function formatTs(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`w-3.5 h-3.5 ${value <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function AdminFeedback() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.admin.feedback.list({
          status: status === "all" ? undefined : status,
          rating: rating === "all" ? undefined : rating,
          search: search.trim() || undefined,
        }),
        api.admin.feedback.stats(),
      ]);
      setRows((Array.isArray(listRes.data) ? listRes.data : []) as FeedbackRow[]);
      setStats({ ...emptyStats, ...(statsRes.data as Stats) });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load feedback");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, rating, search]);

  useEffect(() => {
    load();
  }, [load]);

  const markReviewed = async (id: number, next: "new" | "reviewed") => {
    setUpdatingId(id);
    try {
      await api.admin.feedback.updateStatus(id, next);
      toast.success(next === "reviewed" ? "Marked as reviewed" : "Marked as new");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update feedback");
    } finally {
      setUpdatingId(null);
    }
  };

  const maxBucket = Math.max(1, ...Object.values(stats.distribution || emptyStats.distribution));
  const inputCls =
    "h-9 border border-[#E2E8F0] rounded-lg px-2 text-sm focus:outline-none focus:border-[#272757] bg-white text-[#0F0E47]";

  return (
    <AppShell role="admin" pageTitle="Feedback">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquareHeart className="w-5 h-5 text-[#272757]" />
        <h2 className="text-2xl font-bold text-[#0F0E47]">User feedback</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total feedback", value: String(stats.total) },
          { label: "Average rating", value: stats.total ? `${stats.averageRating} / 5` : "—" },
          { label: "New", value: String(stats.newCount) },
          { label: "Reviewed", value: String(stats.reviewedCount) },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#64748B] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#0F0E47]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#0F0E47] mb-4">Rating distribution</h3>
        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.distribution?.[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const width = Math.round((count / maxBucket) * 100);
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-xs text-[#64748B]">{stars} star</span>
                <div className="flex-1 h-2.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-medium text-[#0F0E47]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Status</label>
            <select className={inputCls + " cursor-pointer"} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Rating</label>
            <select className={inputCls + " cursor-pointer"} value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="all">All</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n} stars
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-[#64748B] mb-1">Search user</label>
            <input
              className={inputCls + " w-full"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
            />
          </div>
          <button
            type="button"
            onClick={load}
            className="h-9 px-4 rounded-lg bg-[#272757] text-white text-sm font-semibold hover:bg-[#1A1952]"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p className="text-sm">Loading feedback…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No feedback found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Rating</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-xs text-[#64748B]">{formatTs(row.createdAt)}</td>
                    <td>
                      <div className="min-w-[140px]">
                        <p className="text-sm font-medium text-[#0F0E47]">{row.user?.name || "User"}</p>
                        <p className="text-xs text-[#8686AC]">{row.user?.email || "—"}</p>
                      </div>
                    </td>
                    <td className="capitalize text-sm">{row.user?.role || "—"}</td>
                    <td>
                      <Stars rating={row.rating} />
                    </td>
                    <td className="capitalize text-sm">{row.category}</td>
                    <td className="max-w-sm">
                      <p className="text-sm text-[#0F0E47] whitespace-pre-wrap break-words">{row.message}</p>
                    </td>
                    <td>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.status === "new"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : "bg-[#D1FAE5] text-[#065F46]"
                        }`}
                      >
                        {row.status === "new" ? "New" : "Reviewed"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={updatingId === row.id}
                        onClick={() =>
                          markReviewed(row.id, row.status === "new" ? "reviewed" : "new")
                        }
                        className="text-xs font-semibold text-[#272757] hover:underline disabled:opacity-50"
                      >
                        {updatingId === row.id
                          ? "Saving…"
                          : row.status === "new"
                            ? "Mark reviewed"
                            : "Mark new"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
