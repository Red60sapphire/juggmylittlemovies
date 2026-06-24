"use client";

export default function MainError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/20">
          <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-white/50">{error?.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-hover transition-all">
          Try again
        </button>
      </div>
    </div>
  );
}
