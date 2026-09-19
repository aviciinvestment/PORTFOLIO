"use client";

import { useState, useEffect, Suspense } from "react";

import { auth, googleProvider } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "unauthorized"
      ? "Access denied. You do not have admin privileges."
      : null,
  );

  useEffect(() => {
    // Check if we are returning from a Google Sign-In redirect
    import("firebase/auth").then(({ getRedirectResult, onAuthStateChanged }) => {
      // 1. Check for active redirect result
      getRedirectResult(auth).then(async (result) => {
        if (result) {
          const user = result.user;
          if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            router.push("/admin");
          } else {
            setError("Access denied. You do not have admin privileges.");
            await auth.signOut();
          }
        }
      }).catch((err) => {
        console.error("Redirect sign in error:", err);
      });

      // 2. Also listen for general auth state
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            router.push("/admin");
          } else {
            setError("Access denied. You do not have admin privileges.");
            await auth.signOut();
          }
        }
      });
      
      return () => unsubscribe();
    });
  }, [searchParams, router]);

  const handleGoogleSignIn = async () => {
    // DO NOT set state before calling signInWithPopup, as React 18 async batching 
    // will cause the browser to lose the click context and block the popup!
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const signInPromise = signInWithPopup(auth, googleProvider);
      
      // Now we can safely set loading state while the promise resolves
      setIsLoading(true);
      setError(null);
      
      await signInPromise;
      // Let onAuthStateChanged handle the redirect
    } catch (err) {
      console.error("Sign in error:", err);
      const firebaseError = err as { code?: string; message?: string };
      // Ignore popup closed by user errors
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setError(firebaseError.message || "Failed to sign in");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center gap-6 mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-white/60 text-sm">Please sign in to access the dashboard</p>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-xl font-medium transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-center text-white/40 text-xs mt-8">
          This area is restricted to authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-black">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
