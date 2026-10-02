export function passwordError(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must include at least one letter";
  if (!/\d/.test(password)) return "Password must include at least one number";
  return "";
}
