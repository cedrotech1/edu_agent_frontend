import { useState } from "react";
import { Star, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { api, ApiError } from "@/lib/api";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature idea" },
  { value: "other", label: "Other" },
] as const;

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please choose a star rating");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Please write a short feedback message");
      return;
    }
    setSubmitting(true);
    try {
      await api.feedback.create({ rating, message: message.trim(), category });
      toast.success("Thank you for your feedback");
      setRating(0);
      setHover(0);
      setCategory("general");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <MessageSquareHeart className="w-4 h-4 text-[#272757]" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold text-[#0F0E47]">Send feedback</h2>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-500">
          Tell us how QuizMind is working for you. Admins review every rating and message.
        </p>

        <div>
          <Label className="text-xs font-medium text-gray-600 mb-2 block">Your rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = (hover || rating) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(value)}
                  className="p-1 rounded-md hover:bg-gray-50"
                >
                  <Star
                    className={`w-6 h-6 ${active ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-xs text-gray-500">
              {rating ? `${rating} / 5` : "Tap a star"}
            </span>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-600 mb-2 block">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#0F0E47] bg-white focus:outline-none focus:border-[#272757]"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-600 mb-2 block">Message</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="What went well? What should we improve?"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#0F0E47] bg-white resize-y min-h-[96px] focus:outline-none focus:border-[#272757]"
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">{message.length}/2000</p>
        </div>

        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="bg-[#272757] hover:bg-[#505081] text-white rounded-xl h-10"
        >
          {submitting ? "Sending…" : "Submit feedback"}
        </Button>
      </div>
    </Card>
  );
}
