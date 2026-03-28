import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/AuthButtons";

export default async function Home() {
  // Fetch the current user session
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    // Check if the user has a favorite movie in the database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { favoriteMovie: true }
    });

    // Route based on whether they have completed onboarding
    if (!dbUser?.favoriteMovie) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  // Unauthenticated landing page
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center max-w-xl bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Movie Memory</h1>
        <p className="text-lg mb-8 text-gray-600">
          Sign in to save your favorite movie and discover fascinating AI-generated facts about it.
        </p>
        <SignInButton />
      </div>
    </main>
  );
}