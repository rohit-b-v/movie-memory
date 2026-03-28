"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { SignOutButton } from "@/components/AuthButtons";

interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null;
  favoriteMovie: string | null;
}

interface FactResponse {
  fact: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editMovieTitle, setEditMovieTitle] = useState("");
  const [editError, setEditError] = useState("");

  const { 
    data: userProfile, 
    mutate: mutateProfile,
    error: profileError 
  } = useSWR<UserProfile>("/api/me", (url) => api.get(url));

  const { 
    data: factData, 
    mutate: mutateFact,
    isValidating: isGeneratingFact,
    error: factError
  } = useSWR<FactResponse>(
    userProfile?.favoriteMovie ? ["/api/fact", userProfile.favoriteMovie] : null,
    ([url]) => api.get(url),
    { dedupingInterval: 30000 }
  );

  useEffect(() => {
    if (userProfile?.favoriteMovie) {
      setEditMovieTitle(userProfile.favoriteMovie);
    }
  }, [userProfile?.favoriteMovie]);

  if (status === "loading" || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  const handleSaveMovie = async () => {
    const trimmedTitle = editMovieTitle.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
      setEditError("Movie title must be between 1 and 100 characters.");
      return;
    }

    setEditError("");
    const previousProfile = userProfile;

    mutateProfile({ ...userProfile, favoriteMovie: trimmedTitle }, false);
    setIsEditing(false);

    try {
      await api.put("/api/me/movie", { movie: trimmedTitle });
      mutateProfile();
    } catch (error: any) {
      mutateProfile(previousProfile, false);
      setEditError(error.message || "Failed to update movie.");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditMovieTitle(userProfile.favoriteMovie || "");
    setEditError("");
    setIsEditing(false);
  };

  // Graceful fallbacks for missing Google data
  const displayName = session?.user?.name || "Movie Fan";
  const displayEmail = session?.user?.email || "No email provided";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500">{displayEmail}</p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Movie & Fact Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          {/* Inline Editing Flow */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Your Favorite Movie
            </h2>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editMovieTitle}
                  onChange={(e) => setEditMovieTitle(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                {editError && <p className="text-sm text-red-600">{editError}</p>}
                <div className="flex space-x-3">
                  <button 
                    onClick={handleSaveMovie}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <p className="text-xl text-gray-900 font-medium">
                  {userProfile.favoriteMovie}
                </p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Fact Display */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                AI Movie Fact
              </h2>
              <button
                onClick={() => mutateFact(undefined, true)}
                disabled={isGeneratingFact || isEditing}
                className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors"
              >
                {isGeneratingFact ? "Generating..." : "Get New Fact"}
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[100px] flex items-center">
              {profileError ? (
                <p className="text-red-600">Failed to load profile data.</p>
              ) : factError ? (
                <p className="text-red-600">Failed to fetch movie fact. Please try again.</p>
              ) : isGeneratingFact && !factData ? (
                <p className="text-gray-500 italic animate-pulse">Consulting the cinematic archives...</p>
              ) : factData ? (
                <p className="text-gray-800 leading-relaxed">{factData.fact}</p>
              ) : (
                <p className="text-gray-500">No fact available yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}