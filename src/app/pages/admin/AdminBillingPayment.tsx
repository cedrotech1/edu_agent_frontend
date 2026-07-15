import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft, CreditCard, Download, FileText, X, CheckCircle,
  Mail, AlertTriangle, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
}

const invoices: Invoice[] = [
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$29.00", status: "paid" },
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

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
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
      setSavingCard(false);
      setShowPaymentModal(false);
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setCardErrors({});
      toast.success("Payment method updated successfully");
    }, 900);
  };

  const handleSaveEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
    toast.success("Billing email updated");
  };

  const handleDownloadAll = () => {
    toast.success("Downloading all invoices as ZIP…");
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading ${id}.pdf`);
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    toast.success("Your plan will remain active until " + renewalDate);
    navigate("/admin/platform-settings");
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/admin/platform-settings")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" /> Platform Settings
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Billing & Payments</h1>
                <p className="text-sm text-gray-500">Manage your payment method and invoices</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/subscription")}
              className="border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl gap-2"
            >
              View Plans <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Billing summary */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#6C63FF]" /> Billing Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Next Billing Date", value: renewalDate },
              { label: "Amount Due", value: "$29.00" },
              { label: "Plan", value: "Professional (Monthly)" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Payment method on file */}
          <div className="flex items-center justify-between p-4 bg-[#6C63FF]/5 rounded-xl border border-[#6C63FF]/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 12/27</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPaymentModal(true)}
              variant="outline"
              className="border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl text-sm"
            >
              Update
            </Button>
          </div>
        </Card>

        {/* Invoice history */}
        <Card className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6C63FF]" /> Invoice History
            </h2>
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              className="border-2 border-gray-200 text-gray-600 rounded-xl text-sm gap-2 hover:border-[#6C63FF] hover:text-[#6C63FF]"
            >
              <Download className="w-4 h-4" /> Download All
            </Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-500">Invoice #</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-500">Amount</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-500">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-700">{inv.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{inv.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={`rounded-full text-xs ${
                      inv.status === "paid"
                        ? "bg-[#43E6B5]/10 text-[#43E6B5]"
                        : "bg-[#FFD166]/10 text-[#FFD166]"
                    }`}>
                      {inv.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="p-2 text-[#6C63FF] hover:bg-[#6C63FF]/10 rounded-lg transition-colors mx-auto"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Billing contact email */}
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6C63FF]" /> Billing Contact
          </h2>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <Label className="mb-2 block text-gray-700">Billing email address</Label>
              <Input
                type="email"
                value={billingEmail}
                onChange={(e) => { setBillingEmail(e.target.value); setEmailSaved(false); }}
                className="rounded-xl border-2 border-gray-200 px-4 py-3"
                placeholder="billing@yourschool.edu"
              />
            </div>
            <Button
              onClick={handleSaveEmail}
              className={`rounded-xl px-6 py-3 font-semibold transition-all shrink-0 ${
                emailSaved
                  ? "bg-[#43E6B5] text-white"
                  : "bg-[#6C63FF] hover:bg-[#5851E6] text-white"
              }`}
            >
              {emailSaved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved</> : "Save"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Invoices and receipts will be sent to this address</p>
        </Card>

        {/* Cancel subscription */}
        <Card className="bg-white rounded-2xl p-6 shadow-md border border-red-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Cancel Subscription</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your plan will remain active until {renewalDate}. After that, you will be downgraded to the free Starter plan.
              </p>
              <Button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Update Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Update Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="mb-2 block text-gray-700">Card Number</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors((p) => ({ ...p, cardNumber: "" })); }}
                  placeholder="1234 5678 9012 3456"
                  className={`rounded-xl border-2 px-4 py-3 font-mono tracking-wider ${cardErrors.cardNumber ? "border-red-400" : "border-gray-200"}`}
                  maxLength={19}
                />
                {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-gray-700">Expiry</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setCardErrors((p) => ({ ...p, expiry: "" })); }}
                    placeholder="MM/YY"
                    className={`rounded-xl border-2 px-4 py-3 ${cardErrors.expiry ? "border-red-400" : "border-gray-200"}`}
                    maxLength={5}
                  />
                  {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                </div>
                <div>
                  <Label className="mb-2 block text-gray-700">CVV</Label>
                  <Input
                    value={cvv}
                    onChange={(e) => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setCardErrors((p) => ({ ...p, cvv: "" })); }}
                    placeholder="•••"
                    type="password"
                    className={`rounded-xl border-2 px-4 py-3 ${cardErrors.cvv ? "border-red-400" : "border-gray-200"}`}
                    maxLength={4}
                  />
                  {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-6 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-[#43E6B5] shrink-0" />
              Your card details are encrypted and stored securely
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}
                className="flex-1 border-2 border-gray-200 rounded-xl py-3">Cancel</Button>
              <Button onClick={handleSaveCard} disabled={savingCard}
                className="flex-1 bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-xl py-3 font-semibold">
                {savingCard ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : "Save Card"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Cancel subscription?</h3>
            <p className="text-gray-500 text-sm mb-2">
              Are you sure you want to cancel?
            </p>
            <p className="text-gray-600 font-medium text-sm mb-8">
              Your plan will remain active until <span className="text-[#6C63FF]">{renewalDate}</span>
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white py-3 rounded-xl font-semibold"
              >
                Keep My Plan
              </Button>
              <button
                onClick={handleCancelConfirm}
                className="w-full py-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors border border-red-200"
              >
                Yes, Cancel Subscription
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
