// Simple in-memory store that persists across React Router navigation.
// Key: `${quizId}-${answerId}`
interface FeedbackEntry {
  text: string;
  teacherName: string;
  teacherInitials: string;
  sentAt: string;
}

export const feedbackStore: Record<string, FeedbackEntry> = {};

export function setFeedback(quizId: string | number, answerId: number, entry: FeedbackEntry) {
  feedbackStore[`${quizId}-${answerId}`] = entry;
}

export function getFeedback(quizId: string | number, answerId: number): FeedbackEntry | null {
  return feedbackStore[`${quizId}-${answerId}`] ?? null;
}
