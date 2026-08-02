import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/dal";
import { getMovieDetails } from "@/lib/tmdb";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const details = await getMovieDetails(movieId);
  return NextResponse.json(details);
}
