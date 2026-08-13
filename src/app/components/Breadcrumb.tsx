import { useNavigate } from "react-router";
import { ChevronRight, ArrowLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();
  const parent = items[items.length - 2];

  return (
    <div className="mb-4">
      {/* Back button */}
      {parent && (
        <button
          onClick={() => navigate(parent.path || "/")}
          className="flex items-center gap-1.5 text-sm text-[#272757] font-medium hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {parent.label}
        </button>
      )}
      {/* Breadcrumb trail */}
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />}
              {isLast ? (
                <span className="text-[#0F0E47] font-medium">{item.label}</span>
              ) : (
                <button
                  onClick={() => item.path && navigate(item.path)}
                  className="text-[#8686AC] hover:text-[#272757] transition-colors"
                >
                  {item.label}
                </button>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
