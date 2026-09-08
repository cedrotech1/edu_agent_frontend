import { Navigate } from "react-router";

/** 2FA is not implemented — send users back to login. */
export function TwoFactorLogin() {
  return <Navigate to="/login" replace />;
}
