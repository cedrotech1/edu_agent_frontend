interface EmptyStateProps {
  icon: React.ElementType;
  heading: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, heading, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#8686AC]" style={{ strokeWidth: 1.5 }} />
      </div>
      <h3 className="text-[18px] font-semibold text-[#0F0E47] mb-2">{heading}</h3>
      <p className="text-[14px] text-[#64748B] max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#272757] text-white text-sm font-semibold rounded-xl hover:bg-[#1A1952] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
