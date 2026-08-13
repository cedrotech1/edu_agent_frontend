import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { OfflineBanner } from './components/OfflineBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AuthProvider } from '@/lib/auth';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <OfflineBanner />
      <CookieConsentBanner />
      <Toaster
        position="bottom-right"
        expand={false}
        richColors={false}
        toastOptions={{
          duration: 4000,
          style: {
            width: "320px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            padding: "14px 16px",
            fontSize: "14px",
            color: "#0F0E47",
          },
          classNames: {
            success: "border-l-4 border-l-[#10B981]",
            error: "border-l-4 border-l-[#EF4444]",
            info: "border-l-4 border-l-[#272757]",
            warning: "border-l-4 border-l-[#F59E0B]",
          },
        }}
        offset={24}
      />
    </AuthProvider>
  );
}
