/** Persist quiz join-code access for a student session (per quiz). */
const key = (quizId: string | number) => `quizmind_quiz_access_${quizId}`;

export function rememberQuizAccessCode(quizId: string | number, code: string) {
  try {
    sessionStorage.setItem(key(quizId), String(code).trim().toUpperCase());
  } catch {
    /* ignore */
  }
}

export function getQuizAccessCode(quizId: string | number): string | undefined {
  try {
    return sessionStorage.getItem(key(quizId)) || undefined;
  } catch {
    return undefined;
  }
}

export function clearQuizAccessCode(quizId: string | number) {
  try {
    sessionStorage.removeItem(key(quizId));
  } catch {
    /* ignore */
  }
}
