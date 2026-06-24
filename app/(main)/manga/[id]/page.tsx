"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { MangaTitle, MangaChapter, MangaVolume } from "@/lib/mangadex";
import { BookOpen, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [manga, setManga] = useState<MangaTitle | null>(null);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<MangaChapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/manga?id=${id}`).then((r) => r.json()),
      fetch(`/api/manga/chapters?mangaId=${id}`).then((r) => r.json()),
    ])
      .then(([mangaData, chapterData]) => {
        setManga(mangaData.manga);
        setChapters(chapterData.chapters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const openChapter = async (chapter: MangaChapter) => {
    setCurrentChapter(chapter);
    setViewerLoading(true);
    setViewerOpen(true);
    try {
      const res = await fetch(`/api/manga/pages?chapterId=${chapter.id}`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    }
    setViewerLoading(false);
  };

  const navigateChapter = (dir: "prev" | "next") => {
    if (!currentChapter) return;
    const idx = chapters.findIndex((c) => c.id === currentChapter.id);
    if (dir === "prev" && idx < chapters.length - 1) {
      openChapter(chapters[idx + 1]);
    } else if (dir === "next" && idx > 0) {
      openChapter(chapters[idx - 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="w-12 h-12 text-white/20 mb-3" />
        <h2 className="text-lg font-semibold text-white/70">Manga not found</h2>
        <Link href="/manga" className="mt-4 text-sm text-accent hover:text-accent-hover">Back to Manga</Link>
      </div>
    );
  }

  if (viewerOpen && currentChapter) {
    return (
      <div className="min-h-screen bg-black">
        {/* Reader Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button onClick={() => { setViewerOpen(false); setPages([]); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <span className="text-sm text-white/70 truncate max-w-[200px] sm:max-w-md">{manga.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Ch. {currentChapter.chapter}</span>
            <button
              onClick={() => navigateChapter("prev")}
              disabled={chapters.indexOf(currentChapter) >= chapters.length - 1}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateChapter("next")}
              disabled={chapters.indexOf(currentChapter) <= 0}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pages - Vertical Scroll */}
        <div className="max-w-4xl mx-auto">
          {viewerLoading ? (
            <div className="flex items-center justify-center min-h-[80vh]">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : pages.length > 0 ? (
            <div className="flex flex-col items-center">
              {pages.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Page ${i + 1}`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              ))}
              <div className="flex items-center gap-4 py-6">
                <button
                  onClick={() => navigateChapter("prev")}
                  disabled={chapters.indexOf(currentChapter) >= chapters.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => navigateChapter("next")}
                  disabled={chapters.indexOf(currentChapter) <= 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/40">
              <p>Failed to load pages</p>
              <button onClick={() => openChapter(currentChapter)} className="mt-3 text-sm text-accent">Retry</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Back link */}
      <Link href="/manga" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Manga
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-[200px] flex-shrink-0 mx-auto md:mx-0">
          <div className="rounded-xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl shadow-black/50">
            {manga.coverUrl ? (
              <img src={manga.coverUrl.replace(".256.", ".512.")} alt={manga.title} className="w-full" loading="lazy" />
            ) : (
              <div className="aspect-[2/3] flex items-center justify-center bg-surface">
                <BookOpen className="w-10 h-10 text-white/20" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">{manga.title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/60 mb-4 flex-wrap">
            {manga.year && <span>{manga.year}</span>}
            <span className="capitalize">{manga.status}</span>
            <span>{manga.chapterCount || "?"} chapters</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {manga.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 bg-white/[0.06] rounded-full text-xs font-medium text-white/70">{tag}</span>
            ))}
          </div>
          <p className="text-white/60 leading-relaxed text-sm md:text-base">{manga.description}</p>
        </div>
      </div>

      {/* Chapters */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-lg font-bold text-white">Chapters</h2>
          <span className="text-xs text-muted">{chapters.length} total</span>
        </div>
        {chapters.length > 0 ? (
          <div className="space-y-1">
            {chapters.map((ch, i) => (
              <motion.button
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => openChapter(ch)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-accent w-10 flex-shrink-0">Ch. {ch.chapter}</span>
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors truncate">
                    {ch.title || `Chapter ${ch.chapter}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted flex-shrink-0">
                  <span>{ch.pages} pages</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted py-8 text-center">No chapters available in English.</p>
        )}
      </section>
    </div>
  );
}
