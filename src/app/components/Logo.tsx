import { Sparkles, Brain, CheckCircle, MessageCircle } from "lucide-react";

interface LogoProps {
  variant?: "horizontal" | "icon-only" | "stacked";
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function Logo({ variant = "horizontal", size = "md", color = "#6C63FF" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  };

  const iconSize = sizes[size].icon;
  const textClass = sizes[size].text;

  // Logo icon: Brain with sparkle
  const LogoIcon = () => (
    <div className="relative">
      <div
        className="rounded-2xl p-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Brain className="w-full h-full" style={{ color }} />
      </div>
      <Sparkles
        className="absolute -top-1 -right-1 w-4 h-4"
        style={{ color: "#FFD166" }}
      />
    </div>
  );

  if (variant === "icon-only") {
    return (
      <div style={{ width: iconSize, height: iconSize }}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: iconSize, height: iconSize }}>
          <LogoIcon />
        </div>
        <div className="text-center">
          <span className={`${textClass} font-bold`} style={{ color }}>
            QuizMind
          </span>
          <span className={`${textClass} font-bold text-gray-700`}> AI</span>
        </div>
      </div>
    );
  }

  // Horizontal (default)
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: iconSize, height: iconSize }}>
        <LogoIcon />
      </div>
      <div>
        <span className={`${textClass} font-bold`} style={{ color }}>
          QuizMind
        </span>
        <span className={`${textClass} font-bold text-gray-700`}> AI</span>
      </div>
    </div>
  );
}
