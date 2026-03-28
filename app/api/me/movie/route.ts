import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movie } = body;

    if (!movie || typeof movie !== "string") {
      return NextResponse.json(
        { error: "Invalid movie data provided" },
        { status: 400 }
      );
    }

    const trimmedMovie = movie.trim();

    if (trimmedMovie.length < 1 || trimmedMovie.length > 100) {
      return NextResponse.json(
        { error: "Movie title must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // Update the authenticated user's profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { favoriteMovie: trimmedMovie },
    });

    return NextResponse.json({
      success: true,
      movie: updatedUser.favoriteMovie,
    });
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { error: "Internal server error while saving movie" },
      { status: 500 }
    );
  }
}