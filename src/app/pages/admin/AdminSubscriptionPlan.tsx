import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Check, Sparkles, Building2, Zap, CreditCard } from "lucide-react";

type BillingCycle = "monthly" | "annual";

interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  price: number | null;
  annualPrice: number | null;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
  current: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    iconColor: "#43E6B5",
    price: 0,
    annualPrice: 0,
    description: "Perfect for individual teachers getting started",
    features: [
      "Up to 5 teachers",
      "Up to 100 students",
      "Basic AI grading",
      "10 quizzes per month",
      "Limited quiz history (30 days)",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    icon: Sparkles,
    iconColor: "#6C63FF",
    price: 29,
    annualPrice: 23,
    description: "Everything a growing school needs",
    features: [
      "Unlimited teachers",
      "Up to 1,000 students",
      "Full AI grading & analytics",
      "Unlimited quizzes",
      "Full quiz history",
      "Priority support",
      "Advanced analytics dashboard",
      "Anti-AI cheating detection",
    ],
    cta: "Upgrade Now",
    highlight: true,
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    iconColor: "#4FC3F7",
    price: null,
    annualPrice: null,
    description: "Custom solutions for large institutions",
    features: [
      "Unlimited everything",
      "Custom AI model tuning",
      "Dedicated account manager",
      "SLA guarantee (99.9% uptime)",
      "White-label option",
      "On-premises deployment",
      "Custom integrations & API",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    highlight: false,
    current: false,
  },
];

export function AdminSubscriptionPlan() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const renewalDate = "August 15, 2026";

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/admin/platform-settings")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" /> Platform Settings
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
                <p className="text-sm text-gray-500">Manage your plan and billing cycle</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/billing")}
              className="border-2 border-[#6C63FF] text-[#6C63FF] rounded-xl gap-2"
            >
              <CreditCard className="w-4 h-4" /> Billing & Payments
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Current plan banner */}
        <Card className="bg-gradient-to-r from-[#6C63FF] to-[#4FC3F7] rounded-2xl p-6 shadow-lg mb-10 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Your current plan</p>
              <h2 className="text-2xl font-bold mb-1">Professional Plan</h2>
              <p className="text-white/80 text-sm">Renews on {renewalDate} · $29/month</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate("/admin/billing")}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl"
              >
                Manage Plan
              </Button>
              <Badge className="bg-white text-[#6C63FF] rounded-full px-4 py-2 text-sm font-semibold self-center">
                Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-white rounded-2xl shadow-md p-1.5 flex items-center gap-2">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                billing === "monthly" ? "bg-[#6C63FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === "annual" ? "bg-[#6C63FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annual
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                billing === "annual" ? "bg-white/20 text-white" : "bg-[#43E6B5]/10 text-[#43E6B5]"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = billing === "annual" ? plan.annualPrice : plan.price;
            return (
              <Card
                key={plan.id}
                className={`relative bg-white rounded-3xl p-7 shadow-md flex flex-col transition-transform hover:-translate-y-1 ${
                  plan.highlight ? "ring-2 ring-[#6C63FF] shadow-xl" : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#6C63FF] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#43E6B5]/10 text-[#43E6B5] rounded-full text-xs font-semibold">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${plan.iconColor}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: plan.iconColor }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price === null ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-800">Custom</p>
                      <p className="text-gray-400 text-sm mt-1">Pricing on request</p>
                    </div>
                  ) : plan.price === 0 ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-800">Free</p>
                      <p className="text-gray-400 text-sm mt-1">Forever</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-1">
                        <p className="text-4xl font-bold text-gray-800">${displayPrice}</p>
                        <p className="text-gray-400 mb-1">/month</p>
                      </div>
                      {billing === "annual" && (
                        <p className="text-[#43E6B5] text-sm font-medium mt-1">
                          Billed as ${(displayPrice! * 12).toFixed(0)}/year
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#43E6B5] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 rounded-xl font-semibold ${
                    plan.highlight
                      ? "bg-[#6C63FF] hover:bg-[#5851E6] text-white"
                      : plan.id === "enterprise"
                      ? "bg-[#4FC3F7] hover:bg-[#29B5E8] text-white"
                      : plan.current
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  disabled={plan.current && plan.id !== "enterprise"}
                >
                  {plan.current ? "Current Plan" : plan.cta}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          All plans include a 14-day free trial · No credit card required for Starter
        </p>
      </div>
    </div>
  );
}
