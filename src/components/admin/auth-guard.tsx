"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/admin";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/admin/login");
        return;
      }

      if (!(await isAdminEmail(user.email ?? ""))) {
        // Logged in with wrong email, sign out and redirect
        await signOut(auth);
        router.push("/admin/login?error=unauthorized");
        return;
      }

      // Valid admin
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
