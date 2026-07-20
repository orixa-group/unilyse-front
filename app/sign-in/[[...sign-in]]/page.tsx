import { Suspense } from "react";
import { FirebaseAuthForm } from "@/components/auth/firebase-auth-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Suspense fallback={null}>
        <FirebaseAuthForm />
      </Suspense>
    </div>
  );
}
