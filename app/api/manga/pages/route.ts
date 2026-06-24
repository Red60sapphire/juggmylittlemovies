import { NextRequest, NextResponse } from "next/server";
import { getChapterPages } from "@/lib/mangadex";

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapterId") || "";

  if (!chapterId) {
    return NextResponse.json({ pages: [], pagesDataSaver: [], baseUrl: "" });
  }

  try {
    const data = await getChapterPages(chapterId);
    return NextResponse.json(data || { pages: [], pagesDataSaver: [], baseUrl: "" });
  } catch {
    return NextResponse.json({ pages: [], pagesDataSaver: [], baseUrl: "" });
  }
}
