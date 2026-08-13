import { X } from "lucide-react";
import { useEffect } from "react";

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export function StandardModal({ isOpen, onClose, title, children, footer, maxWidth = 480 }: StandardModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-[12px] w-full flex flex-col"
        style={{
          maxWidth,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-[18px] font-bold text-[#0F0E47] leading-snug">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8686AC] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalCancelButton({ onClick, label = "Cancel" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
    >
      {label}
    </button>
  );
}

export function ModalPrimaryButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2 bg-[#272757] text-white rounded-xl text-sm font-semibold hover:bg-[#1A1952] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

export function ModalDestructiveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 bg-[#EF4444] text-white rounded-xl text-sm font-semibold hover:bg-[#DC2626] transition-colors"
    >
      {label}
    </button>
  );
}
