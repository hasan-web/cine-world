import { NextResponse, type NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/dal";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ results: [] });

  const results = await searchMovies(query);
  return NextResponse.json({ results });
}
