"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyWatchRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/watch/movie/${params.id}`);
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}
