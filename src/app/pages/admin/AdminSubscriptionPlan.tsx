import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Check,
  Sparkles,
  Building2,
  Zap,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";

type BillingCycle = "monthly" | "annual";

const plans = [
  {
    id: "starter", name: "Starter", icon: Zap, iconColor: "#10B981", price: 0, annualPrice: 0,
    description: "Perfect for individual teachers getting started",
    features: ["Up to 5 teachers", "Up to 100 students", "Basic AI grading", "10 quizzes per month", "Limited quiz history (30 days)", "Email support"],
    cta: "Get Started", highlight: false, current: false,
  },
  {
    id: "professional", name: "Professional", icon: Sparkles, iconColor: "#272757", price: 29, annualPrice: 23,
    description: "Everything a growing school needs",
    features: ["Unlimited teachers", "Up to 1,000 students", "Full AI grading & analytics", "Unlimited quizzes", "Full quiz history", "Priority support", "Advanced analytics dashboard", "Anti-AI cheating detection"],
    cta: "Upgrade Now", highlight: true, current: true,
  },
  {
    id: "enterprise", name: "Enterprise", icon: Building2, iconColor: "#272757", price: null, annualPrice: null,
    description: "Custom solutions for large institutions",
    features: ["Unlimited everything", "Custom AI model tuning", "Dedicated account manager", "SLA guarantee (99.9% uptime)", "White-label option", "On-premises deployment", "Custom integrations & API", "24/7 phone support"],
    cta: "Contact Sales", highlight: false, current: false,
  },
];

export function AdminSubscriptionPlan() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const renewalDate = "August 15, 2026";

  return (
    <AppShell role="admin" pending={true} pageTitle="Subscription Plans">
      {/* Current plan banner */}
      <Card className="bg-gradient-to-r from-[#272757] to-[#272757] rounded-2xl p-6 shadow-md mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-xs mb-1">Your current plan</p>
            <h2 className="text-xl font-bold mb-0.5">Professional Plan</h2>
            <p className="text-white/70 text-sm">Renews on {renewalDate} · $29/month</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <Button onClick={() => navigate("/admin/billing")}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl h-9 px-4 text-sm">Manage Plan</Button>
            <Badge className="bg-white text-[#272757] rounded-full px-4 py-1.5 text-xs font-semibold">Active</Badge>
          </div>
        </div>
      </Card>

      {/* Billing toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex items-center gap-2">
          <button onClick={() => setBilling("monthly")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billing === "monthly" ? "bg-[#272757] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Monthly
          </button>
          <button onClick={() => setBilling("annual")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billing === "annual" ? "bg-[#272757] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Annual
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${billing === "annual" ? "bg-white/20 text-white" : "bg-[#10B981]/10 text-[#10B981]"}`}>Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const displayPrice = billing === "annual" ? plan.annualPrice : plan.price;
          return (
            <Card key={plan.id}
              className={`relative bg-white rounded-2xl p-6 shadow-sm border flex flex-col transition-transform hover:-translate-y-1 ${
                plan.highlight ? "border-[#272757] shadow-lg ring-1 ring-[#272757]" : "border-gray-100"
              }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#272757] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">Most Popular</span>
                </div>
              )}
              {plan.current && (
                <div className="absolute top-4 right-4">
                  <Badge className="qm-badge qm-badge-active text-xs">Current Plan</Badge>
                </div>
              )}

              <div className="mb-5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${plan.iconColor}18` }}>
                  <Icon className="w-5 h-5" style={{ color: plan.iconColor, strokeWidth: 1.75 }} />
                </div>
                <h3 className="text-lg font-bold text-[#0F0E47] mb-0.5">{plan.name}</h3>
                <p className="text-gray-400 text-xs">{plan.description}</p>
              </div>

              <div className="mb-5">
                {plan.price === null ? (
                  <div><p className="text-2xl font-bold text-[#0F0E47]">Custom</p><p className="text-gray-400 text-xs mt-0.5">Pricing on request</p></div>
                ) : plan.price === 0 ? (
                  <div><p className="text-2xl font-bold text-[#0F0E47]">Free</p><p className="text-gray-400 text-xs mt-0.5">Forever</p></div>
                ) : (
                  <div>
                    <div className="flex items-end gap-1">
                      <p className="text-3xl font-bold text-[#0F0E47]">${displayPrice}</p>
                      <p className="text-gray-400 text-sm mb-0.5">/month</p>
                    </div>
                    {billing === "annual" && <p className="text-[#10B981] text-xs font-medium mt-1">Billed as ${(displayPrice! * 12).toFixed(0)}/year</p>}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" style={{ strokeWidth: 2 }} />{feature}
                  </li>
                ))}
              </ul>

              <Button disabled={plan.current && plan.id !== "enterprise"}
                className={`w-full rounded-xl h-10 font-semibold text-sm ${
                  plan.highlight ? "bg-[#272757] hover:bg-[#505081] text-white"
                  : plan.id === "enterprise" ? "bg-[#272757] hover:bg-[#29B5E8] text-white"
                  : plan.current ? "bg-gray-100 text-gray-400 cursor-default"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}>
                {plan.current ? "Current Plan" : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-gray-400 text-xs mt-6">All plans include a 14-day free trial · No credit card required for Starter</p>
    </AppShell>
  );
}
