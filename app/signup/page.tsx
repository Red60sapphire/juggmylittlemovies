import { Suspense } from "react";
import UsernameAuthForm from "@/components/UsernameAuthForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <UsernameAuthForm mode="signup" />
    </Suspense>
  );
}
