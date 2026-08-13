import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  CreditCard,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { toast } from "sonner";

const invoices = [
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "$29.00", status: "paid" as const },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$29.00", status: "paid" as const },
];

export function AdminBillingPayment() {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billingEmail, setBillingEmail] = useState("admin@quizmind.rw");
  const [emailSaved, setEmailSaved] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [savingCard, setSavingCard] = useState(false);

  const renewalDate = "August 15, 2026";

  const formatCardNumber = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Enter a valid 16-digit card number";
    if (expiry.length < 5) e.expiry = "Enter MM/YY";
    if (cvv.length < 3) e.cvv = "Enter 3-digit CVV";
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveCard = () => {
    if (!validateCard()) return;
    setSavingCard(true);
    setTimeout(() => {
      setSavingCard(false); setShowPaymentModal(false);
      setCardNumber(""); setExpiry(""); setCvv(""); setCardErrors({});
      toast.success("Payment method updated successfully");
    }, 900);
  };

  const handleSaveEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) { toast.error("Enter a valid email address"); return; }
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
    toast.success("Billing email updated");
  };

  return (
    <AppShell role="admin" pending={true} pageTitle="Billing & Payments">
      <div className="max-w-3xl space-y-5">
        {/* Header action */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate("/admin/subscription")}
            className="border border-[#272757] text-[#272757] rounded-xl h-10 px-4 text-sm gap-1">
            View Plans <ChevronRight className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
          </Button>
        </div>

        {/* Billing summary */}
        <Card className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="qm-section-heading text-sm mb-5">Billing Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Next Billing Date", value: renewalDate },
              { label: "Amount Due",         value: "$29.00" },
              { label: "Plan",               value: "Professional (Monthly)" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-semibold text-[#0F0E47] text-sm">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-4 bg-[#EDE9FE] rounded-xl border border-[#272757]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-[#272757] rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" style={{ strokeWidth: 1.75 }} />
              </div>
              <div>
                <p className="font-medium text-[#0F0E47] text-sm">Visa ending in 4242</p>
                <p className="text-xs text-gray-400">Expires 12/27</p>
              </div>
            </div>
            <Button onClick={() => setShowPaymentModal(true)} variant="outline"
              className="border border-[#272757] text-[#272757] rounded-xl h-9 px-4 text-sm">Update</Button>
          </div>
        </Card>

        {/* Invoice history */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="qm-section-heading text-sm">Invoice History</h2>
            <Button onClick={() => toast.success("Downloading all invoices…")} variant="outline"
              className="border border-gray-200 text-gray-500 rounded-xl h-9 px-4 text-xs gap-1.5 hover:border-[#272757] hover:text-[#272757]">
              <Download className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} /> Download All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full qm-table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Invoice #</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 last:border-0 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono font-medium text-gray-700">{inv.id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{inv.date}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#0F0E47]">{inv.amount}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge className="qm-badge qm-badge-active">✓ Paid</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button onClick={() => toast.success(`Downloading ${inv.id}.pdf`)}
                        className="p-2 text-[#272757] hover:bg-[#EDE9FE] rounded-lg transition-colors mx-auto">
                        <Download className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Billing contact */}
        <Card className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="qm-section-heading text-sm mb-5">Billing Contact</h2>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <Label className="mb-1.5 block text-gray-700 text-sm">Billing email address</Label>
              <Input type="email" value={billingEmail}
                onChange={(e) => { setBillingEmail(e.target.value); setEmailSaved(false); }}
                className="qm-input" placeholder="billing@yourschool.edu" />
            </div>
            <Button onClick={handleSaveEmail}
              className={`rounded-xl h-11 px-5 font-semibold shrink-0 ${emailSaved ? "bg-[#10B981] text-white" : "bg-[#272757] hover:bg-[#505081] text-white"}`}>
              {emailSaved ? <><CheckCircle className="w-4 h-4 mr-2" style={{ strokeWidth: 1.75 }} />Saved</> : "Save"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Invoices and receipts will be sent to this address</p>
        </Card>

        {/* Cancel subscription */}
        <Card className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" style={{ strokeWidth: 1.75 }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#0F0E47] text-sm mb-1">Cancel Subscription</p>
              <p className="text-xs text-gray-400 mb-3">Your plan stays active until {renewalDate}, then downgrades to Starter.</p>
              <Button onClick={() => setShowCancelModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl h-9 px-4 text-xs">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Update Payment Modal */}
      {showPaymentModal && (
        <div className="qm-modal-overlay">
          <div className="qm-modal">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0F0E47]">Update Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl">
                <X className="w-4 h-4 text-gray-500" style={{ strokeWidth: 1.75 }} />
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <Label className="mb-1.5 block text-gray-700 text-sm">Card Number</Label>
                <Input value={cardNumber}
                  onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors((p) => ({ ...p, cardNumber: "" })); }}
                  placeholder="1234 5678 9012 3456"
                  className={`qm-input font-mono tracking-wider ${cardErrors.cardNumber ? "border-red-400!" : ""}`}
                  maxLength={19} />
                {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-gray-700 text-sm">Expiry</Label>
                  <Input value={expiry}
                    onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setCardErrors((p) => ({ ...p, expiry: "" })); }}
                    placeholder="MM/YY" className={`qm-input ${cardErrors.expiry ? "border-red-400!" : ""}`} maxLength={5} />
                  {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                </div>
                <div>
                  <Label className="mb-1.5 block text-gray-700 text-sm">CVV</Label>
                  <Input value={cvv}
                    onChange={(e) => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setCardErrors((p) => ({ ...p, cvv: "" })); }}
                    placeholder="•••" type="password" className={`qm-input ${cardErrors.cvv ? "border-red-400!" : ""}`} maxLength={4} />
                  {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-5 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" style={{ strokeWidth: 1.75 }} />
              Your card details are encrypted and stored securely
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1 border border-gray-200 rounded-xl h-11">Cancel</Button>
              <Button onClick={handleSaveCard} disabled={savingCard} className="flex-1 bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-11">
                {savingCard ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</span> : "Save Card"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="qm-modal-overlay">
          <div className="qm-modal text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" style={{ strokeWidth: 1.75 }} />
            </div>
            <h3 className="text-lg font-bold text-[#0F0E47] mb-2">Cancel subscription?</h3>
            <p className="text-gray-400 text-sm mb-1">Are you sure you want to cancel?</p>
            <p className="text-gray-600 font-medium text-sm mb-6">Plan stays active until <span className="text-[#272757]">{renewalDate}</span></p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => setShowCancelModal(false)} className="w-full bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-11 font-semibold">Keep My Plan</Button>
              <button onClick={() => { setShowCancelModal(false); toast.success("Subscription cancelled"); navigate("/admin/platform-settings"); }}
                className="w-full py-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium border border-red-200 transition-colors">
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
