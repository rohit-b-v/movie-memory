"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [movie, setMovie] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedMovie = movie.trim();
    if (trimmedMovie.length < 1 || trimmedMovie.length > 100) {
      setError("Movie title must be between 1 and 100 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/me/movie", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie: trimmedMovie }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save movie");
      }

      // Route to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome!</h1>
        <p className="text-gray-600 mb-6">
          To get started, tell us your absolute favorite movie.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="movie" className="block text-sm font-medium text-gray-700 mb-1">
              Favorite Movie
            </label>
            <input
              id="movie"
              type="text"
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              placeholder="e.g. The Matrix"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !movie.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}